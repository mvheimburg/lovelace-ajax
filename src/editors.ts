import { language } from "./localize";
import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { watchRegistries } from "./registry";
import type { HassConnection, HomeAssistant, RegistrySnapshot } from "./types";

type EditorConfig = Record<string, unknown>;
type DeviceChoice = { id: string; name: string };

const copy = {
  en: {
    title: "Title",
    appearance: "Appearance",
    default: "Default",
    bubble: "Bubble",
    temperature: "Show temperature",
    battery: "Battery warning (%)",
    bypass: "Allow bypass controls",
    grouping: "Group by",
    area: "Area",
    deviceGroup: "Device",
    none: "No grouping",
    alarm: "Alarm entity",
    noAlarm: "No alarm entity",
    device: "Device",
    selectDevice: "Select an Aegis device",
    deviceHelp:
      "Choose a device discovered from the Aegis for Ajax integration.",
    fallback:
      "Registry discovery failed. Enter an exact Aegis device ID or unique name.",
    requiredDevice: "Select or enter an Aegis device.",
    threshold: "Enter a number from 0–100.",
  },
  nb: {
    title: "Tittel",
    appearance: "Utseende",
    default: "Standard",
    bubble: "Bubble",
    temperature: "Vis temperatur",
    battery: "Batterivarsel (%)",
    bypass: "Tillat forbikoblingskontroller",
    grouping: "Grupper etter",
    area: "Område",
    deviceGroup: "Enhet",
    none: "Ingen gruppering",
    alarm: "Alarmentitet",
    noAlarm: "Ingen alarmentitet",
    device: "Enhet",
    selectDevice: "Velg en Aegis-enhet",
    deviceHelp: "Velg en enhet funnet fra Aegis for Ajax-integrasjonen.",
    fallback:
      "Registeroppslag mislyktes. Skriv inn eksakt Aegis-enhets-ID eller unikt navn.",
    requiredDevice: "Velg eller skriv inn en Aegis-enhet.",
    threshold: "Skriv inn et tall fra 0–100.",
  },
};

abstract class AegisEditor extends LitElement {
  protected config: EditorConfig = {};
  private _hass?: HomeAssistant;
  private stopRegistry?: () => void;
  private watchedConnection?: HassConnection;
  protected deviceChoices?: DeviceChoice[];
  protected registryFailed = false;
  protected invalidBattery = false;
  protected invalidDevice = false;
  protected abstract deviceCard: boolean;

  set hass(value: HomeAssistant | undefined) {
    const previousConnection = this._hass?.connection;
    this._hass = value;
    this.requestUpdate("hass");
    if (
      this.deviceCard &&
      value &&
      previousConnection !== value.connection &&
      this.isConnected
    )
      this.startRegistryWatch();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  setConfig(config: EditorConfig): void {
    this.config = { ...config };
    this.invalidBattery = false;
    this.invalidDevice = false;
    this.requestUpdate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.deviceCard && this._hass) this.startRegistryWatch();
  }

  disconnectedCallback(): void {
    this.stopRegistry?.();
    this.stopRegistry = undefined;
    this.watchedConnection = undefined;
    super.disconnectedCallback();
  }

  protected get text() {
    return /^(nb|no|nn)(-|$)/.test(language(this.hass)) ? copy.nb : copy.en;
  }

  private startRegistryWatch(): void {
    const hass = this._hass;
    if (!hass || this.watchedConnection === hass.connection) return;
    this.stopRegistry?.();
    this.watchedConnection = hass.connection;
    this.deviceChoices = undefined;
    this.registryFailed = false;
    this.requestUpdate();
    this.stopRegistry = watchRegistries(hass, (value) => {
      this.registryFailed = Boolean(value.error || value.disconnected);
      this.deviceChoices = value.snapshot
        ? this.choicesFromSnapshot(value.snapshot)
        : [];
      this.requestUpdate();
    });
  }

  private choicesFromSnapshot(snapshot: RegistrySnapshot): DeviceChoice[] {
    const ids = new Set(
      snapshot.entities
        .filter((entry) => entry.platform === "aegis_ajax" && entry.device_id)
        .map((entry) => entry.device_id as string),
    );
    return snapshot.devices
      .filter((device) => ids.has(device.id) && !device.disabled_by)
      .map((device) => ({
        id: device.id,
        name: device.name_by_user || device.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const battery = this.renderRoot.querySelector<HTMLInputElement>(
      '[name="battery_warning"]',
    );
    battery?.setAttribute("aria-invalid", String(this.invalidBattery));
    const device = this.renderRoot.querySelector<
      HTMLInputElement | HTMLSelectElement
    >('[name="device"]');
    device?.setAttribute("aria-invalid", String(this.invalidDevice));
  }

  private emit(config: EditorConfig): void {
    this.config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
    this.requestUpdate();
  }

  protected changed(event: Event): void {
    const control = event.target as HTMLInputElement | HTMLSelectElement;
    const key = control.name;
    if (!key) return;
    const next = { ...this.config };
    if (key === "battery_warning") {
      const value = Number(control.value);
      this.invalidBattery =
        control.value.trim() === "" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100;
      this.requestUpdate();
      if (this.invalidBattery) return;
      next[key] = value;
    } else if (key === "device" && !control.value.trim()) {
      this.invalidDevice = true;
      this.requestUpdate();
      return;
    } else if (
      control instanceof HTMLInputElement &&
      control.type === "checkbox"
    ) {
      next[key] = control.checked;
    } else if (
      (key === "title" || key === "alarm_entity") &&
      !control.value.trim()
    ) {
      delete next[key];
    } else {
      next[key] = control.value;
    }
    this.invalidBattery = false;
    this.invalidDevice = false;
    this.emit(next);
  }

  protected commonFields() {
    const t = this.text;
    return html`
      <label
        >${t.title}<input
          name="title"
          .value=${String(this.config.title ?? "")}
          @change=${this.changed}
      /></label>
      <label
        >${t.appearance}
        <select
          name="appearance"
          .value=${String(this.config.appearance ?? "default")}
          @change=${this.changed}
        >
          <option value="default">${t.default}</option>
          <option value="bubble">${t.bubble}</option>
        </select>
      </label>
      <label class="check"
        ><input
          type="checkbox"
          name="show_temperature"
          .checked=${this.config.show_temperature !== false}
          @change=${this.changed}
        />${t.temperature}</label
      >
      <label
        >${t.battery}<input
          type="number"
          min="0"
          max="100"
          step="1"
          name="battery_warning"
          .value=${String(this.config.battery_warning ?? 20)}
          @change=${this.changed}
          aria-describedby="battery-error"
      /></label>
      ${this.invalidBattery ? html`<p id="battery-error" class="error" role="alert">${t.threshold}</p>` : nothing}
      <label class="check"
        ><input
          type="checkbox"
          name="allow_bypass"
          .checked=${this.config.allow_bypass === true}
          @change=${this.changed}
        />${t.bypass}</label
      >
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
    }
    .form {
      display: grid;
      gap: 16px;
      padding: 8px 0;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 14px;
    }
    input,
    select {
      box-sizing: border-box;
      width: 100%;
      min-height: 42px;
      padding: 8px 10px;
      color: inherit;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 6px;
      font: inherit;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .check input {
      width: 20px;
      min-height: 20px;
    }
    .help,
    .error {
      margin: -8px 0 0;
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .error {
      color: var(--error-color, #db4437);
    }
    [aria-invalid="true"] {
      border-color: var(--error-color, #db4437);
    }
  `;
}

export class AegisPanelCardEditor extends AegisEditor {
  protected deviceCard = false;

  render() {
    const t = this.text;
    const alarms = Object.values(this.hass?.states ?? {})
      .filter((state) => state.entity_id.startsWith("alarm_control_panel."))
      .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
    return html`<div class="form">
      ${this.commonFields()}
      <label
        >${t.grouping}<select
          name="group_by"
          .value=${String(this.config.group_by ?? "area")}
          @change=${this.changed}
        >
          <option value="area">${t.area}</option>
          <option value="device">${t.deviceGroup}</option>
          <option value="none">${t.none}</option>
        </select></label
      >
      <label
        >${t.alarm}<select name="alarm_entity" @change=${this.changed}>
          <option value="" ?selected=${!this.config.alarm_entity}>
            ${t.noAlarm}
          </option>
          ${alarms.map((state) => html`<option value=${state.entity_id} ?selected=${this.config.alarm_entity === state.entity_id}>${String(state.attributes.friendly_name ?? state.entity_id)}</option>`)}
        </select></label
      >
    </div>`;
  }
}

export class AegisDeviceCardEditor extends AegisEditor {
  protected deviceCard = true;

  render() {
    const t = this.text;
    const value = String(this.config.device ?? "");
    const nameCounts = new Map<string, number>();
    for (const device of this.deviceChoices ?? []) {
      nameCounts.set(device.name, (nameCounts.get(device.name) ?? 0) + 1);
    }
    const configuredName =
      value &&
      !this.deviceChoices?.some((device) => device.id === value) &&
      this.deviceChoices?.some((device) => device.name === value)
        ? value
        : undefined;
    const deviceField = this.registryFailed
      ? html`<label
            >${t.device}<input
              name="device"
              .value=${value}
              @change=${this.changed}
          /></label>
          <p class="help">${t.fallback}</p>`
      : html`<label
            >${t.device}<select name="device" @change=${this.changed}>
              <option value="" ?selected=${!value}>${t.selectDevice}</option>
              ${
                configuredName
                  ? html`<option value=${configuredName} selected>
                      ${configuredName}${(nameCounts.get(configuredName) ?? 0) > 1 ? ` — ${t.selectDevice}` : ""}
                    </option>`
                  : nothing
              }
              ${(this.deviceChoices ?? []).map((device) => html`<option value=${device.id} ?selected=${value === device.id}>${device.name}${(nameCounts.get(device.name) ?? 0) > 1 ? ` (${device.id})` : ""}</option>`)}
            </select></label
          >
          <p class="help">${t.deviceHelp}</p>`;
    return html`<div class="form">
      ${deviceField}
      ${
        this.invalidDevice
          ? html`<p class="error" role="alert">${t.requiredDevice}</p>`
          : nothing
      }
      ${this.commonFields()}
    </div>`;
  }
}

if (!customElements.get("aegis-panel-card-editor"))
  customElements.define("aegis-panel-card-editor", AegisPanelCardEditor);
if (!customElements.get("aegis-device-card-editor"))
  customElements.define("aegis-device-card-editor", AegisDeviceCardEditor);
