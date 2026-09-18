import { LitElement, html, nothing, type TemplateResult } from "lit";
import { validateConfig, type CardConfig, type PanelConfig } from "./config";
import { deviceHealth, discoverDevices } from "./model";
import { watchRegistries, refreshRegistries } from "./registry";
import { language, localize, type MessageKey } from "./localize";
import { styles } from "./styles";
import type {
  AegisDevice,
  HomeAssistant,
  RegistryWatchValue,
  DeviceHealth,
  EntityRole,
  BatteryReading,
} from "./types";
export class AegisCardBase extends LitElement {
  static styles = styles;
  protected deviceCard = false;
  protected config?: CardConfig;
  private ha?: HomeAssistant;
  protected registry: RegistryWatchValue = {};
  // Invalidations outlive a reconnect, even when all readings return unchanged.
  protected registryEpoch = 0;
  private stop?: () => void;
  private timer?: ReturnType<typeof setInterval>;
  private detailId?: string;
  protected t(key: MessageKey, count?: number) {
    return localize(language(this.ha), key, count);
  }
  set hass(value: HomeAssistant) {
    const replace = this.ha?.connection !== value.connection;
    this.ha = value;
    if (replace) {
      this.stop?.();
      this.stop = undefined;
      this.registry = {};
      if (this.isConnected) this.watch();
    }
    this.requestUpdate();
  }
  get hass() {
    return this.ha!;
  }
  setConfig(config: Record<string, unknown>) {
    this.config = validateConfig(config, this.deviceCard);
    this.requestUpdate();
  }
  getCardSize() {
    return this.deviceCard ? 3 : 5;
  }
  connectedCallback() {
    super.connectedCallback();
    this.watch();
    this.timer = setInterval(() => this.requestUpdate(), 1000);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop?.();
    this.stop = undefined;
    this.registry = {};
    this.registryEpoch += 1;
    this.requestUpdate();
    clearInterval(this.timer);
    this.closeDialog();
  }
  private watch() {
    if (this.ha && !this.stop)
      this.stop = watchRegistries(this.ha, (value) => {
        this.registry = value;
        if (!value.snapshot) this.registryEpoch += 1;
        this.requestUpdate();
      });
  }
  private retry() {
    this.registry = {};
    if (this.ha) refreshRegistries(this.ha);
    this.requestUpdate();
  }
  protected get devices(): AegisDevice[] {
    if (!this.registry.snapshot || !this.ha) return [];
    const devices = discoverDevices(this.registry.snapshot, this.ha.states);
    if (!this.deviceCard) return devices;
    const selected = String(this.config?.device ?? "");
    const exact = devices.find((d) => d.id === selected);
    return exact ? [exact] : devices.filter((d) => d.name === selected);
  }
  protected health(device: AegisDevice) {
    return deviceHealth(device, this.ha!.states, this.config!.battery_warning);
  }
  private moreInfo(entityId: string) {
    this.closeDialog();
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }
  private async details(device: AegisDevice) {
    this.detailId = device.id;
    this.requestUpdate();
    await this.updateComplete;
    this.shadowRoot!.querySelector<HTMLDialogElement>("#details")?.showModal();
  }
  protected closeDialog() {
    this.shadowRoot
      ?.querySelectorAll("dialog")
      .forEach((dialog) => dialog.close());
  }
  private number(value: number): string {
    return new Intl.NumberFormat(language(this.ha), {
      maximumFractionDigits: 10,
    }).format(value);
  }
  private reading(entityId: string) {
    const state = this.ha?.states[entityId];
    return !state || state.state === "unknown"
      ? this.t("unknown")
      : state.state === "unavailable"
        ? this.t("offline")
        : `${state.state === "on" || state.state === "off" ? this.t(state.state) : state.state.trim() && Number.isFinite(Number(state.state)) ? this.number(Number(state.state)) : state.state} ${state.attributes.unit_of_measurement ?? ""}`.trim();
  }
  private badges(device: AegisDevice, health: DeviceHealth) {
    const active = (
      [
        "alarm",
        "tamper",
        "problem",
        "lowBattery",
        "bypassed",
        "update",
      ] as const
    )
      .filter((key) => health[key].length)
      .map((key) => this.t(key === "bypassed" ? "bypass" : key));
    if (health.unknown.length)
      active.push(`${health.unknown.length} ${this.t("unknown")}`);
    if (!active.length && health.online === "online")
      active.push(this.t("clear"));
    const chip = (label: string, value?: string, kind = "") =>
      html`<span class="chip ${kind}"
        >${label}${value !== undefined ? `: ${value}` : ""}</span
      >`;
    return html`${chip(this.t(health.online))}${active.map((label) => chip(label, undefined, label === this.t("alarm") ? "alarm-chip" : label === this.t("tamper") || label === this.t("bypass") ? "attention-chip" : ""))}
    ${device.entities.battery.length ? chip(this.t("battery"), health.minBattery?.value !== undefined ? `${this.number(health.minBattery.value)}${health.minBattery.unit ?? "%"}` : device.entities.battery.map((e) => this.reading(e.entityId)).join(", ")) : nothing}
    ${device.entities.signal.map((e) => chip(this.t("signal"), this.reading(e.entityId)))}
    ${this.config?.show_temperature ? device.entities.temperature.map((e) => chip(this.t("temperature"), this.reading(e.entityId))) : nothing}`;
  }

  private rank(h: DeviceHealth) {
    return h.alarm.length
      ? 0
      : h.problem.length || h.tamper.length || h.bypassed.length
        ? 1
        : h.online === "offline"
          ? 2
          : h.lowBattery.length
            ? 3
            : 4;
  }
  protected renderActions(
    _device?: AegisDevice,
  ): TemplateResult | typeof nothing {
    void _device;
    return nothing;
  }
  protected renderFeedback(): TemplateResult | typeof nothing {
    return nothing;
  }
  protected renderConfirmation(): TemplateResult | typeof nothing {
    return nothing;
  }
  render() {
    if (!this.config) return nothing;
    const devices = this.devices;
    let sorted = [...devices].sort(
      (a, b) =>
        this.rank(this.health(a)) - this.rank(this.health(b)) ||
        a.name.localeCompare(b.name),
    );
    const alarms = devices.flatMap((device) =>
      this.health(device).alarm.map((alarm) => ({ device, alarm })),
    );
    const detail = devices.find((d) => d.id === this.detailId);
    const panel = this.config as PanelConfig;
    if (!this.deviceCard && panel.group_by === "area") {
      const groups = new Map<string, AegisDevice[]>();
      for (const device of sorted) {
        const key = device.area?.id ?? "";
        groups.set(key, [...(groups.get(key) ?? []), device]);
      }
      sorted = [...groups.values()].flat();
    }
    const battery = devices
      .map((d) => this.health(d).minBattery)
      .filter((v): v is BatteryReading => v?.value !== undefined)
      .sort((a, b) => a.value! - b.value!);
    const disabledCount = devices.reduce(
      (sum, device) => sum + device.disabledCount,
      0,
    );
    let previousArea: string | undefined;
    const registryError = this.registry.disconnected
      ? this.t("disconnected")
      : this.registry.error
        ? `${this.t("error")}: ${this.registry.error}`
        : undefined;
    return html`<ha-card class=${this.config.appearance}
        ><h2>
          ${this.config.title ?? (this.deviceCard ? (devices[0]?.name ?? "Aegis") : "Aegis")}
        </h2>
        ${
          registryError
            ? html`<p role="alert">${registryError}</p>
                ${this.registry.disconnected ? nothing : html`<button @click=${this.retry}>${this.t("retry")}</button>`}`
            : !this.registry.snapshot
              ? html`<p role="status">${this.t("loading")}</p>`
              : this.deviceCard && devices.length !== 1
                ? html`<p role="alert">
                    ${this.t(devices.length ? "ambiguous" : "noMatch")}
                  </p>`
                : !devices.length
                  ? html`<p>${this.t("empty")}</p>`
                  : html`
                      ${
                        !alarms.length
                          ? html`<div class="summary">
                              ${devices.length}
                              ${this.t("devices", devices.length)} ·
                              ${(["online", "offline", "unknown"] as const).map((status) => html`${devices.filter((d) => this.health(d).online === status).length} ${this.t(status)} · `)}${battery.length ? html`${this.t("battery")}: ${this.number(battery[0].value!)}${battery[0].unit ?? ""}` : nothing}
                            </div>`
                          : nothing
                      }
                      ${
                        alarms.length
                          ? html`<section
                              class="takeover"
                              aria-label=${this.t("alarm")}
                            >
                              <strong>⚠ ${this.t("alarm")}</strong>${alarms.map(
                                ({ device, alarm }) => {
                                  const since = Date.parse(
                                    alarm.state?.last_changed ?? "",
                                  );
                                  const seconds = Number.isFinite(since)
                                    ? Math.max(
                                        0,
                                        Math.floor((Date.now() - since) / 1000),
                                      )
                                    : undefined;
                                  return html`<button
                                    data-alarm
                                    @click=${() => this.moreInfo(alarm.entityId)}
                                  >
                                    ${device.name} ·
                                    ${device.area?.name ?? this.t("noArea")}<br />${alarm.state?.attributes.friendly_name ?? alarm.registry.name ?? (alarm.state?.attributes.device_class === "heat" ? this.t("heat") : this.t("smoke"))}
                                    ·
                                    ${seconds === undefined ? this.t("unknown") : `${Math.floor(seconds / 60)}m ${seconds % 60}s`}
                                    ${this.t("elapsed")}
                                  </button>`;
                                },
                              )}
                              ${devices.filter((device) => this.health(device).alarm.length).map((device) => html`<button data-device=${device.id} @click=${() => this.details(device)}>${this.t("details")}: ${device.name}</button>`)}
                            </section>`
                          : nothing
                      }
                      ${(alarms.length ? [] : sorted).map((device) => {
                        const health = this.health(device);
                        const area = device.area?.name ?? this.t("noArea");
                        const heading =
                          !this.deviceCard &&
                          panel.group_by === "area" &&
                          previousArea !== (device.area?.id ?? "");
                        previousArea = device.area?.id ?? "";
                        return html`<section
                          ?data-device-group=${panel.group_by === "device"}
                          class=${panel.group_by === "device" ? "device-group" : ""}
                        >
                          ${heading ? html`<h3>${area}</h3>` : nothing}<button
                            data-device=${device.id}
                            class="device ${health.alarm.length ? "alarm" : health.tamper.length ? "tamper" : ""}"
                            @click=${() => this.details(device)}
                          >
                            <span class="symbol" aria-hidden="true"
                              >${health.alarm.length ? "⚠" : "◈"}</span
                            ><span
                              ><strong>${device.name}</strong
                              ><span class="muted">${area}</span
                              ><span class="readings"
                                >${this.badges(device, health)}</span
                              ></span
                            >
                          </button>
                        </section>`;
                      })}${alarms.length ? nothing : this.renderActions(this.deviceCard ? devices[0] : undefined)}
                      ${disabledCount ? html`<p class="disabled-notice"><a href="/config/entities">${disabledCount} ${this.t("disabled", disabledCount)}</a></p>` : nothing}
                    `
        }${panel.alarm_entity && this.ha?.states[panel.alarm_entity] ? html`<div class="actions"><button data-alarm-control @click=${() => this.moreInfo(panel.alarm_entity!)}>${this.t("alarmControl")}</button></div>` : nothing}${this.renderFeedback()}</ha-card
      >
      <dialog id="details" aria-labelledby="detail-title">
        <h2 id="detail-title">${detail?.name}</h2>
        ${
          detail
            ? html`${Object.entries(detail.entities).map(([role, entities]) =>
                role === "temperature" && !this.config?.show_temperature
                  ? nothing
                  : entities.length
                    ? html`<h3>${this.t(role as EntityRole as MessageKey)}</h3>
                        ${entities.map((entity) => html`<button class="entity" @click=${() => this.moreInfo(entity.entityId)}><span>${this.ha?.states[entity.entityId]?.attributes.friendly_name ?? entity.registry.name ?? entity.entityId}</span><span>${this.reading(entity.entityId)}</span></button>`)}`
                    : nothing,
              )}${this.health(detail).bypassed.map(
                (bypass) =>
                  html`<p>
                      ${this.t("deactivation")}:
                      ${bypass.deactivationKinds.join(", ") || this.t("unknown")}
                    </p>
                    <p>${this.t("caution")}</p>`,
              )}${detail.disabledCount ? html`<p><a href="/config/entities">${detail.disabledCount} ${this.t("disabled", detail.disabledCount)}</a></p>` : nothing}${this.renderActions(detail)}${this.renderFeedback()}`
            : nothing
        }
        <div class="actions">
          <button
            @click=${() => this.shadowRoot!.querySelector<HTMLDialogElement>("#details")!.close()}
          >
            ${this.t("close")}
          </button>
        </div>
      </dialog>
      ${this.renderConfirmation()}`;
  }
}
