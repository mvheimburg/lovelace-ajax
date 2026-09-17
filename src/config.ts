export interface CommonConfig {
  type?: string;
  title?: string;
  appearance: "default" | "bubble";
  show_temperature: boolean;
  battery_warning: number;
  allow_bypass: boolean;
  [key: string]: unknown;
}
export interface PanelConfig extends CommonConfig {
  group_by: "area" | "device" | "none";
  alarm_entity?: string;
}
export interface DeviceConfig extends CommonConfig {
  device: string;
}
export type CardConfig = PanelConfig | DeviceConfig;
export function validateConfig(
  input: Record<string, unknown>,
  deviceCard = false,
): CardConfig {
  if (!input || typeof input !== "object")
    throw new Error("Card configuration is required");
  const config = {
    appearance: "default",
    show_temperature: true,
    battery_warning: 20,
    allow_bypass: false,
    ...(!deviceCard ? { group_by: "area" } : {}),
    ...input,
  };
  if (!["default", "bubble"].includes(String(config.appearance)))
    throw new Error("appearance must be default or bubble");
  for (const key of ["show_temperature", "allow_bypass"])
    if (typeof config[key as keyof typeof config] !== "boolean")
      throw new Error(`${key} must be boolean`);
  if (
    typeof config.battery_warning !== "number" ||
    !Number.isFinite(config.battery_warning) ||
    config.battery_warning < 0 ||
    config.battery_warning > 100
  )
    throw new Error("battery_warning must be 0–100");
  if (input.title !== undefined && typeof input.title !== "string")
    throw new Error("title must be text");
  if (deviceCard && (typeof input.device !== "string" || !input.device.trim()))
    throw new Error("device must be an exact device ID or name");
  if (
    !deviceCard &&
    !["area", "device", "none"].includes(String(config.group_by))
  )
    throw new Error("group_by must be area, device or none");
  if (
    input.alarm_entity !== undefined &&
    (typeof input.alarm_entity !== "string" ||
      !input.alarm_entity.startsWith("alarm_control_panel."))
  )
    throw new Error("alarm_entity must be an alarm_control_panel entity");
  return config as CardConfig;
}
