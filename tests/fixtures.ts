export const snapshot = {
  devices: [
    { id: "ajax-workshop", name: "Ajax detector", name_by_user: "Workshop", area_id: "workshop" },
    { id: "knx-smoke", name: "Hall KNX smoke", area_id: "hall" },
  ],
  areas: [
    { area_id: "workshop", name: "Workshop area" },
    { area_id: "hall", name: "Hall" },
  ],
  labels: [
    { label_id: "generated-batteries", name: "Aegis: Batteries" },
    { label_id: "aegis_tamper", name: "Aegis: Tamper" },
    { label_id: "aegis_temperature", name: "Aegis: Temperature" },
    { label_id: "aegis_connectivity", name: "Aegis: Connectivity" },
  ],
  entities: [
    { entity_id: "binary_sensor.workshop_smoke", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-1", labels: [] },
    { entity_id: "binary_sensor.workshop_heat", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-2", labels: [] },
    { entity_id: "binary_sensor.workshop_case", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-3", labels: ["aegis_tamper"] },
    { entity_id: "binary_sensor.workshop_fault", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-4", labels: [] },
    { entity_id: "binary_sensor.workshop_connectivity", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-5", labels: [] },
    { entity_id: "sensor.workshop_cell_a", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-6", labels: ["generated-batteries"] },
    { entity_id: "sensor.workshop_battery_level", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-7", labels: [] },
    { entity_id: "binary_sensor.workshop_low_battery", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-8", labels: [] },
    { entity_id: "sensor.workshop_probe", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-9", labels: ["aegis_temperature"] },
    { entity_id: "sensor.workshop_signal_strength", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-10", labels: [] },
    { entity_id: "switch.workshop_bypass", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-11", labels: ["generated-batteries"] },
    { entity_id: "update.workshop_firmware", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-12", labels: [] },
    { entity_id: "button.workshop_identify", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-13", labels: [] },
    { entity_id: "sensor.workshop_disabled", platform: "aegis_ajax", device_id: "ajax-workshop", unique_id: "opaque-14", disabled_by: "user", labels: [] },
    { entity_id: "binary_sensor.hall_smoke", platform: "knx", device_id: "knx-smoke", unique_id: "hall_smoke", original_device_class: "smoke", labels: [] },
  ],
};

export const healthyStates = {
  "binary_sensor.workshop_smoke": { entity_id: "binary_sensor.workshop_smoke", state: "off", attributes: { device_class: "smoke" }, last_changed: "2026-09-17T08:00:00Z" },
  "binary_sensor.workshop_heat": { entity_id: "binary_sensor.workshop_heat", state: "off", attributes: { device_class: "heat" }, last_changed: "2026-09-17T08:00:00Z" },
  "binary_sensor.workshop_case": { entity_id: "binary_sensor.workshop_case", state: "off", attributes: { device_class: "problem" }, last_changed: "2026-09-17T08:00:00Z" },
  "binary_sensor.workshop_fault": { entity_id: "binary_sensor.workshop_fault", state: "off", attributes: { device_class: "problem" }, last_changed: "2026-09-17T08:00:00Z" },
  "binary_sensor.workshop_connectivity": { entity_id: "binary_sensor.workshop_connectivity", state: "on", attributes: { device_class: "connectivity" }, last_changed: "2026-09-17T08:00:00Z" },
  "sensor.workshop_cell_a": { entity_id: "sensor.workshop_cell_a", state: "51", attributes: { unit_of_measurement: "%" }, last_changed: "2026-09-17T08:00:00Z" },
  "sensor.workshop_battery_level": { entity_id: "sensor.workshop_battery_level", state: "44", attributes: { device_class: "battery", unit_of_measurement: "%" }, last_changed: "2026-09-17T08:00:00Z" },
  "binary_sensor.workshop_low_battery": { entity_id: "binary_sensor.workshop_low_battery", state: "off", attributes: { device_class: "battery" }, last_changed: "2026-09-17T08:00:00Z" },
  "sensor.workshop_probe": { entity_id: "sensor.workshop_probe", state: "19.2", attributes: { unit_of_measurement: "°C" }, last_changed: "2026-09-17T08:00:00Z" },
  "sensor.workshop_signal_strength": { entity_id: "sensor.workshop_signal_strength", state: "2", attributes: {}, last_changed: "2026-09-17T08:00:00Z" },
  "switch.workshop_bypass": { entity_id: "switch.workshop_bypass", state: "off", attributes: { deactivation_kinds: [] }, last_changed: "2026-09-17T08:00:00Z" },
  "update.workshop_firmware": { entity_id: "update.workshop_firmware", state: "off", attributes: {}, last_changed: "2026-09-17T08:00:00Z" },
  "button.workshop_identify": { entity_id: "button.workshop_identify", state: "unknown", attributes: {}, last_changed: "2026-09-17T08:00:00Z" },
};
