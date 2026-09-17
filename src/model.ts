import type {
  AegisDevice,
  BatteryReading,
  BypassReading,
  DeviceEntities,
  DeviceEntity,
  DeviceHealth,
  EntityRegistryEntry,
  EntityRole,
  HassEntity,
  HassStates,
  HealthEntry,
  RegistrySnapshot,
} from "./types";

const ROLES: EntityRole[] = [
  "alarm",
  "tamper",
  "problem",
  "connectivity",
  "battery",
  "bypass",
  "update",
  "temperature",
  "signal",
  "other",
];

function emptyEntities(): DeviceEntities {
  return Object.fromEntries(ROLES.map((role) => [role, []])) as unknown as DeviceEntities;
}

const labelRoles: Record<string, { role: EntityRole; domains: string[] }> = {
  aegis_alarm: { role: "alarm", domains: ["binary_sensor"] },
  aegis_tamper: { role: "tamper", domains: ["binary_sensor"] },
  aegis_connectivity: { role: "connectivity", domains: ["binary_sensor"] },
  aegis_battery: { role: "battery", domains: ["sensor", "binary_sensor"] },
  aegis_temperature: { role: "temperature", domains: ["sensor"] },
};

const labelNameRoles: Record<string, string> = {
  "Aegis: Alarm": "aegis_alarm",
  "Aegis: Tamper": "aegis_tamper",
  "Aegis: Connectivity": "aegis_connectivity",
  "Aegis: Batteries": "aegis_battery",
  "Aegis: Temperature": "aegis_temperature",
};

function roleFor(
  entry: EntityRegistryEntry,
  state: HassEntity | undefined,
  recognizedLabels: Map<string, string>,
): EntityRole {
  const domain = entry.entity_id.split(".", 1)[0];
  for (const label of entry.labels ?? []) {
    const match = labelRoles[recognizedLabels.get(label) ?? label];
    if (match?.domains.includes(domain)) return match.role;
  }

  const deviceClass = typeof state?.attributes.device_class === "string" ? state.attributes.device_class : undefined;
  if (domain === "binary_sensor") {
    if (deviceClass === "smoke" || deviceClass === "heat") return "alarm";
    if (deviceClass === "tamper") return "tamper";
    if (deviceClass === "problem") return "problem";
    if (deviceClass === "connectivity") return "connectivity";
    if (deviceClass === "battery") return "battery";
  }
  if (domain === "sensor") {
    if (deviceClass === "battery") return "battery";
    if (deviceClass === "temperature") return "temperature";
    if (deviceClass === "signal_strength") return "signal";
  }
  if (domain === "update" && deviceClass === "firmware") return "update";

  const suffixes = [entry.entity_id.toLowerCase(), entry.unique_id.toLowerCase()];
  const endsWith = (suffix: string) => suffixes.some((value) => value.endsWith(suffix));
  if (domain === "switch" && endsWith("_bypass")) return "bypass";
  if (domain === "update" && endsWith("_firmware")) return "update";
  if (domain === "binary_sensor" && (endsWith("_smoke_detected") || endsWith("_high_temperature"))) return "alarm";
  if (domain === "binary_sensor" && endsWith("_connectivity")) return "connectivity";
  if (domain === "binary_sensor" && endsWith("_problem")) return "problem";
  if (domain === "binary_sensor" && endsWith("_tamper")) return "tamper";
  if ((domain === "sensor" || domain === "binary_sensor") && (endsWith("_battery_level") || endsWith("_low_battery"))) return "battery";
  if (domain === "sensor" && endsWith("_temperature")) return "temperature";
  if (domain === "sensor" && endsWith("_signal_strength")) return "signal";
  return "other";
}

export function discoverDevices(snapshot: RegistrySnapshot, states: HassStates): AegisDevice[] {
  const byDevice = new Map<string, EntityRegistryEntry[]>();
  for (const entity of snapshot.entities) {
    if (entity.platform !== "aegis_ajax" || !entity.device_id) continue;
    const entries = byDevice.get(entity.device_id) ?? [];
    entries.push(entity);
    byDevice.set(entity.device_id, entries);
  }

  const areas = new Map(snapshot.areas.map((area) => [area.area_id, area]));
  const recognizedLabels = new Map(
    snapshot.labels
      .filter((label) => labelNameRoles[label.name])
      .map((label) => [label.label_id, labelNameRoles[label.name]]),
  );
  const devices: AegisDevice[] = [];
  for (const registry of snapshot.devices) {
    const registeredEntities = byDevice.get(registry.id);
    if (!registeredEntities || registry.disabled_by) continue;
    const entities = emptyEntities();
    let disabledCount = 0;
    for (const registryEntity of registeredEntities) {
      if (registryEntity.disabled_by) {
        disabledCount += 1;
        continue;
      }
      const entity: DeviceEntity = { entityId: registryEntity.entity_id, registry: registryEntity };
      entities[roleFor(registryEntity, states[registryEntity.entity_id], recognizedLabels)].push(entity);
    }
    const areaRegistry = registry.area_id ? areas.get(registry.area_id) : undefined;
    devices.push({
      id: registry.id,
      name: registry.name_by_user || registry.name,
      area: areaRegistry ? { id: areaRegistry.area_id, name: areaRegistry.name } : undefined,
      registry,
      entities,
      unknownEntries: entities.other,
      disabledCount,
    });
  }
  return devices;
}

function finding(entity: DeviceEntity, state?: HassEntity): HealthEntry {
  return { ...entity, state };
}

function isUnknown(state?: HassEntity): boolean {
  return !state || state.state === "unknown";
}

export function deviceHealth(device: AegisDevice, states: HassStates, batteryWarning: number): DeviceHealth {
  const health: DeviceHealth = {
    alarm: [], tamper: [], problem: [], offline: [], lowBattery: [], bypassed: [], update: [], unknown: [], online: "unknown",
  };

  const allEntities = Object.values(device.entities).flat();
  for (const entity of allEntities) {
    const state = states[entity.entityId];
    if (state?.state === "unavailable") health.offline.push(finding(entity, state));
    else if (isUnknown(state)) health.unknown.push(finding(entity, state));
  }

  for (const role of ["alarm", "tamper", "problem", "update"] as const) {
    for (const entity of device.entities[role]) {
      const state = states[entity.entityId];
      if (state?.state === "on") health[role].push(finding(entity, state));
    }
  }

  const numericBatteries: BatteryReading[] = [];
  for (const entity of device.entities.battery) {
    const state = states[entity.entityId];
    const binary = entity.entityId.startsWith("binary_sensor.");
    const numericState = !binary && state && state.state.trim() !== "" ? Number(state.state) : undefined;
    const value = numericState !== undefined && Number.isFinite(numericState) ? numericState : undefined;
    const reading: BatteryReading = {
      ...finding(entity, state),
      binary,
      value,
      unit: typeof state?.attributes.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : undefined,
    };
    if (!binary && state && state.state !== "unknown" && state.state !== "unavailable" && value === undefined) {
      health.unknown.push(finding(entity, state));
    }
    if (reading.value !== undefined) numericBatteries.push(reading);
    if ((binary && state?.state === "on") || (reading.value !== undefined && reading.value < batteryWarning)) {
      health.lowBattery.push(reading);
    }
  }
  health.minBattery = numericBatteries.reduce<BatteryReading | undefined>(
    (lowest, reading) => lowest === undefined || reading.value! < lowest.value! ? reading : lowest,
    undefined,
  );

  for (const entity of device.entities.bypass) {
    const state = states[entity.entityId];
    if (state?.state !== "on") continue;
    const attribute = state.attributes.deactivation_kinds;
    const deactivationKinds = Array.isArray(attribute) ? attribute.filter((kind): kind is string => typeof kind === "string") : [];
    const bypass: BypassReading = {
      ...finding(entity, state),
      deactivationKinds,
      wholeDevice: deactivationKinds.some((kind) => kind.endsWith("_whole")),
    };
    health.bypassed.push(bypass);
  }

  const connectivity = device.entities.connectivity.map((entity) => states[entity.entityId]);
  const hasOff = connectivity.some((state) => state?.state === "off" || state?.state === "unavailable");
  const hasOn = connectivity.some((state) => state?.state === "on");
  if (health.offline.length > 0 || hasOff) health.online = "offline";
  else if (hasOn) health.online = "online";
  return health;
}
