export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export type HassStates = Record<string, HassEntity>;

export interface EntityRegistryEntry {
  entity_id: string;
  platform: string;
  device_id: string | null;
  unique_id: string;
  name?: string | null;
  original_name?: string | null;
  disabled_by?: string | null;
  labels?: string[];
}

export interface DeviceRegistryEntry {
  id: string;
  name: string;
  name_by_user?: string | null;
  area_id?: string | null;
  disabled_by?: string | null;
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
}

export interface LabelRegistryEntry {
  label_id: string;
  name: string;
}

export interface RegistrySnapshot {
  entities: EntityRegistryEntry[];
  devices: DeviceRegistryEntry[];
  areas: AreaRegistryEntry[];
  labels: LabelRegistryEntry[];
}

export interface HassConnection {
  sendMessagePromise<T>(message: { type: string }): Promise<T>;
  subscribeEvents<T>(
    callback: (event: T) => void,
    eventType: string,
  ): Promise<() => void>;
}

export interface HomeAssistant {
  connection: HassConnection;
  states: HassStates;
  language?: string;
  callService?(
    domain: string,
    service: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}

export type EntityRole =
  | "alarm"
  | "tamper"
  | "problem"
  | "connectivity"
  | "battery"
  | "bypass"
  | "update"
  | "temperature"
  | "signal"
  | "other";

export interface DeviceEntity {
  entityId: string;
  registry: EntityRegistryEntry;
}

export type DeviceEntities = Record<EntityRole, DeviceEntity[]>;

export interface AegisDevice {
  id: string;
  name: string;
  area?: { id: string; name: string };
  registry: DeviceRegistryEntry;
  entities: DeviceEntities;
  unknownEntries: DeviceEntity[];
  disabledCount: number;
}

export interface HealthEntry extends DeviceEntity {
  state?: HassEntity;
}

export interface BatteryReading extends HealthEntry {
  value?: number;
  unit?: string;
  binary: boolean;
}

export interface BypassReading extends HealthEntry {
  deactivationKinds: string[];
  wholeDevice: boolean;
}

export type ConnectivityStatus = "online" | "offline" | "unknown";

export interface DeviceHealth {
  alarm: HealthEntry[];
  tamper: HealthEntry[];
  problem: HealthEntry[];
  offline: HealthEntry[];
  lowBattery: BatteryReading[];
  bypassed: BypassReading[];
  update: HealthEntry[];
  unknown: HealthEntry[];
  online: ConnectivityStatus;
  minBattery?: BatteryReading;
}

export interface RegistryWatchValue {
  snapshot?: RegistrySnapshot;
  error?: string;
}
