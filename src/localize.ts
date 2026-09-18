import type { HomeAssistant } from "./types";
export function language(
  hass?: Pick<HomeAssistant, "language" | "locale">,
): string {
  const value = (hass?.language || hass?.locale?.language || "en")
    .replace(/_/g, "-")
    .toLowerCase();
  if (/^(nb|nn|no)(-|$)/.test(value)) return "nb-NO";
  try {
    return Intl.getCanonicalLocales(value)[0] ?? "en";
  } catch {
    return "en";
  }
}
const en = {
  on: "On",
  off: "Off",
  details: "Details",
  heat: "Heat",
  smoke: "Smoke",
  loading: "Loading Aegis devices…",
  error: "Unable to load registries",
  disconnected: "Home Assistant disconnected. Waiting to reconnect…",
  retry: "Retry",
  empty: "No Aegis devices found",
  online: "online",
  offline: "offline",
  unknown: "unknown",
  devices: "devices",
  battery: "Battery",
  alarm: "Alarm",
  tamper: "Tamper",
  problem: "Problem",
  bypass: "Bypass",
  update: "Update available",
  lowBattery: "Low battery",
  temperature: "Temperature",
  signal: "Signal",
  other: "Other",
  connectivity: "Connectivity",
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm",
  bypassAll: "Bypass available devices",
  restoreAll: "Restore available devices",
  restore: "Restore",
  pending: "Sending…",
  disabled: "disabled entities — entity settings",
  noArea: "No area",
  noMatch: "No matching Aegis device. Use an exact device ID or name.",
  ambiguous: "Device name is ambiguous. Use an exact device ID.",
  alarmControl: "Alarm panel",
  clear: "No active alerts",
  elapsed: "elapsed",
  scope: "Available switches",
  changed: "Device scope changed. Review and confirm again.",
  failed: "Some actions failed",
  sent: "Request sent. Waiting for Home Assistant state.",
  deactivation: "Deactivation kinds",
  caution:
    "Bypass may deactivate tamper only or the whole device, depending on integration settings.",
  selection: "Selected devices",
  bypassed: "Bypassed",
  statusOk: "OK",
  lowestBattery: "lowest battery",
  noContact: "No contact for",
  detectedFor: "Detected for",
  triggered: "Triggered",
  intact: "Intact",
  tamperOnly: "Only tamper alerts are off. Smoke and heat are still reported.",
  wholeDevice: "The whole device is bypassed and will not report.",
  offlineNote: "Cannot report fire while offline.",
  more: "More",
  attention: "needs attention",
  allReadings: "All readings",
};
const nb: typeof en = {
  on: "På",
  off: "Av",
  details: "Detaljer",
  heat: "Varme",
  smoke: "Røyk",
  loading: "Laster Aegis-enheter…",
  error: "Kunne ikke laste registre",
  disconnected: "Home Assistant er frakoblet. Venter på ny tilkobling…",
  retry: "Prøv igjen",
  empty: "Fant ingen Aegis-enheter",
  online: "tilkoblet",
  offline: "frakoblet",
  unknown: "ukjent",
  devices: "enheter",
  battery: "Batteri",
  alarm: "Alarm",
  tamper: "Sabotasje",
  problem: "Problem",
  bypass: "Forbikoble",
  update: "Oppdatering tilgjengelig",
  lowBattery: "Lavt batteri",
  temperature: "Temperatur",
  signal: "Signal",
  other: "Andre",
  connectivity: "Tilkobling",
  close: "Lukk",
  cancel: "Avbryt",
  confirm: "Bekreft",
  bypassAll: "Forbikoble tilgjengelige enheter",
  restoreAll: "Gjenopprett tilgjengelige enheter",
  restore: "Gjenopprett",
  pending: "Sender…",
  disabled: "deaktiverte entiteter — entitetsinnstillinger",
  noArea: "Uten område",
  noMatch: "Ingen Aegis-enhet funnet. Bruk eksakt enhets-ID eller navn.",
  ambiguous: "Enhetsnavnet er ikke entydig. Bruk eksakt enhets-ID.",
  alarmControl: "Alarmpanel",
  clear: "Ingen aktive varsler",
  elapsed: "forløpt",
  scope: "Tilgjengelige brytere",
  changed: "Enhetsutvalget er endret. Kontroller og bekreft på nytt.",
  failed: "Noen handlinger mislyktes",
  sent: "Forespørsel sendt. Venter på tilstand fra Home Assistant.",
  deactivation: "Deaktiveringstyper",
  caution:
    "Forbikobling kan deaktivere bare sabotasje eller hele enheten, avhengig av integrasjonens innstillinger.",
  selection: "Valgte enheter",
  bypassed: "Forbikoblet",
  statusOk: "I orden",
  lowestBattery: "lavest batteri",
  noContact: "Ingen kontakt på",
  detectedFor: "Oppdaget for",
  triggered: "Utløst",
  intact: "Intakt",
  tamperOnly:
    "Bare sabotasjevarsel er slått av. Røyk og varme varsles fortsatt.",
  wholeDevice: "Hele enheten er forbikoblet og varsler ikke.",
  offlineNote: "Kan ikke varsle brann mens den er frakoblet.",
  more: "Mer",
  attention: "trenger tilsyn",
  allReadings: "Alle målinger",
};
export type MessageKey = keyof typeof en;
export function localize(
  language: string | undefined,
  key: MessageKey,
  count?: number,
): string {
  const norwegian = /^(nb|no|nn)(-|$)/.test(
    (language ?? "").replace(/_/g, "-").toLowerCase(),
  );
  if (count === 1 && key === "devices") return norwegian ? "enhet" : "device";
  if (count === 1 && key === "disabled")
    return norwegian
      ? "deaktivert entitet — entitetsinnstillinger"
      : "disabled entity — entity settings";
  return (norwegian ? nb : en)[key];
}
