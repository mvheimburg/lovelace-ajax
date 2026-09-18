import { LitElement, html, nothing, type TemplateResult } from "lit";
import { validateConfig, type CardConfig, type PanelConfig } from "./config";
import { deviceHealth, discoverDevices } from "./model";
import { watchRegistries, refreshRegistries } from "./registry";
import { language, localize, type MessageKey } from "./localize";
import { styles } from "./styles";
import { icon, type Severity } from "./icons";
import type {
  AegisDevice,
  HomeAssistant,
  RegistryWatchValue,
  DeviceHealth,
  EntityRole,
  BatteryReading,
  HealthEntry,
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
        : `${state.state === "on" || state.state === "off" ? this.t(state.state) : state.state.trim() && Number.isFinite(Number(state.state)) ? this.number(Number(state.state)) : state.state}\u00a0${state.attributes.unit_of_measurement ?? ""}`.trim();
  }
  private severity(h: DeviceHealth): Severity {
    if (h.alarm.length) return "alarm";
    if (h.problem.length || h.tamper.length || h.bypassed.length)
      return "attention";
    if (h.online === "offline") return "offline";
    if (h.lowBattery.length) return "battery";
    // Stray unknown readings (e.g. a never-pressed button) stay a chip only.
    if (h.online === "unknown") return "unknown";
    return "ok";
  }
  private statusLabel(h: DeviceHealth, severity: Severity): string {
    if (severity === "attention")
      return this.t(
        h.tamper.length ? "tamper" : h.problem.length ? "problem" : "bypassed",
      );
    const keys: Record<Exclude<Severity, "attention">, MessageKey> = {
      alarm: "alarm",
      offline: "offline",
      battery: "lowBattery",
      unknown: "unknown",
      ok: "statusOk",
    };
    return this.t(keys[severity]);
  }
  /** Readings worth showing; unavailable ones are covered by the offline status. */
  private live<T extends { entityId: string }>(entities: T[]): T[] {
    return entities.filter(
      (e) => this.ha?.states[e.entityId]?.state !== "unavailable",
    );
  }
  private batteryText(device: AegisDevice, h: DeviceHealth) {
    const batteries = this.live(device.entities.battery);
    if (!batteries.length) return undefined;
    return h.minBattery?.value !== undefined
      ? `${this.number(h.minBattery.value)}${h.minBattery.unit ?? "%"}`
      : batteries.map((e) => this.reading(e.entityId)).join(", ");
  }
  private lower(text: string) {
    return text.toLocaleLowerCase(language(this.ha));
  }
  /** Localized "3 h 12 min"; Intl unit names keep this out of the dictionaries. */
  private duration(ms: number): string {
    const unit = (value: number, name: string) =>
      new Intl.NumberFormat(language(this.ha), {
        style: "unit",
        unit: name,
        unitDisplay: "short",
      }).format(value);
    const minutes = Math.max(0, Math.floor(ms / 60000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days) return `${unit(days, "day")} ${unit(hours % 24, "hour")}`;
    if (hours) return `${unit(hours, "hour")} ${unit(minutes % 60, "minute")}`;
    return unit(minutes, "minute");
  }
  private elapsed(since?: string): string {
    const start = Date.parse(since ?? "");
    if (!Number.isFinite(start)) return this.t("unknown");
    const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const pad = (value: number) => String(value).padStart(2, "0");
    const hours = Math.floor(seconds / 3600);
    const rest = `${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
    return hours
      ? `${hours}:${rest}`
      : `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
  }
  /** Reasons first, then context and readings, as one wrapping line. */
  private segments(device: AegisDevice, h: DeviceHealth, wide: boolean) {
    const out: Array<{ label: string; kind?: string }> = [];
    const reasons: Array<[keyof DeviceHealth, MessageKey, string]> = [
      ["alarm", "alarm", "alarm-chip"],
      ["tamper", "tamper", "attention-chip"],
      ["problem", "problem", "attention-chip"],
      ["bypassed", "bypassed", "attention-chip"],
      ["lowBattery", "lowBattery", "attention-chip"],
      ["update", "update", ""],
    ];
    for (const [key, message, kind] of reasons)
      if ((h[key] as unknown[]).length)
        out.push({ label: this.t(message), kind });
    if (h.online !== "online")
      out.push({
        label: this.t(h.online),
        kind: h.online === "offline" ? "offline-chip" : "",
      });
    if (h.unknown.length)
      out.push({ label: `${h.unknown.length} ${this.t("unknown")}` });
    if ((this.config as PanelConfig).group_by !== "area" && !this.deviceCard)
      out.push({ label: device.area?.name ?? this.t("noArea") });
    const battery = this.batteryText(device, h);
    if (battery) out.push({ label: `${this.t("battery")} ${battery}` });
    if (wide)
      for (const e of this.live(device.entities.signal))
        out.push({ label: `${this.t("signal")} ${this.reading(e.entityId)}` });
    if (this.config?.show_temperature)
      for (const e of this.live(device.entities.temperature))
        out.push({ label: this.reading(e.entityId) });
    if (out[0])
      out[0].label =
        out[0].label.charAt(0).toLocaleUpperCase(language(this.ha)) +
        out[0].label.slice(1);
    return out;
  }
  private renderSegments(segments: Array<{ label: string; kind?: string }>) {
    return segments.map(
      (segment, index) =>
        html`${index ? " · " : ""}<span class="chip ${segment.kind ?? ""}"
            >${segment.label}</span
          >`,
    );
  }
  protected renderRowAction(
    _device: AegisDevice,
    _health: DeviceHealth,
  ): TemplateResult | typeof nothing {
    void _device;
    void _health;
    return nothing;
  }
  private renderRow(device: AegisDevice, h: DeviceHealth) {
    const severity = this.severity(h);
    const wide =
      severity !== "ok" || (this.config as PanelConfig).group_by === "device";
    return html`<div class="row sev-${severity} ${wide ? "wide" : ""}">
      <button
        data-device=${device.id}
        class="pill"
        @click=${() => this.details(device)}
      >
        <span class="icon">${icon(severity)}</span
        ><span class="text"
          ><strong>${device.name}</strong
          ><span class="sub readings"
            >${this.renderSegments(this.segments(device, h, wide))}</span
          ></span
        >
      </button>
      ${this.renderRowAction(device, h)}
    </div>`;
  }
  private renderList(
    sorted: AegisDevice[],
    health: (d: AegisDevice) => DeviceHealth,
  ) {
    const panel = this.config as PanelConfig;
    const rows = (devices: AegisDevice[]) =>
      html`<div class="grid">
        ${devices.map((device) => this.renderRow(device, health(device)))}
      </div>`;
    if (panel.group_by === "device")
      return sorted.map(
        (device) =>
          html`<section data-device-group class="device-group">
            ${rows([device])}
          </section>`,
      );
    if (panel.group_by !== "area") return rows(sorted);
    const groups = new Map<string, { name: string; devices: AegisDevice[] }>();
    for (const device of sorted) {
      const key = device.area?.id ?? "";
      const group = groups.get(key) ?? {
        name: device.area?.name ?? this.t("noArea"),
        devices: [],
      };
      group.devices.push(device);
      groups.set(key, group);
    }
    return [...groups.values()].map(
      (group) =>
        html`<section class="group">
          <h3>${group.name}</h3>
          ${rows(group.devices)}
        </section>`,
    );
  }
  private renderSummary(
    devices: AegisDevice[],
    health: (d: AegisDevice) => DeviceHealth,
  ) {
    const count = (predicate: (h: DeviceHealth) => boolean) =>
      devices.filter((device) => predicate(health(device))).length;
    const online = count((h) => h.online === "online");
    const offline = count((h) => h.online === "offline");
    const unknown = count((h) => h.online === "unknown");
    const battery = devices
      .map((d) => health(d).minBattery)
      .filter((v): v is BatteryReading => v?.value !== undefined)
      .sort((a, b) => a.value! - b.value!)[0];
    const issues = (
      [
        [(h: DeviceHealth) => h.tamper.length > 0, "tamper"],
        [(h: DeviceHealth) => h.problem.length > 0, "problem"],
        [(h: DeviceHealth) => h.bypassed.length > 0, "bypassed"],
        [(h: DeviceHealth) => h.lowBattery.length > 0, "lowBattery"],
        [(h: DeviceHealth) => h.update.length > 0, "update"],
      ] as const
    )
      .map(([predicate, key]) => [count(predicate), key] as const)
      .filter(([n]) => n > 0)
      .map(([n, key]) => `${n} ${this.lower(this.t(key))}`);
    const overview = [
      `${devices.length} ${this.t("devices", devices.length)}`,
      ...issues,
    ];
    if (!issues.length && !offline && !unknown) overview.push(this.t("clear"));
    const tile = (value: string, label: string, severity = "") =>
      html`<div class="tile ${severity}">
        <span class="value">${value}</span> <span class="label">${label}</span>
      </div>`;
    return html`<div class="summary">
      <p class="overview">${overview.join(" · ")}</p>
      <div class="tiles">
        ${tile(this.number(online), this.t("online"), "sev-ok")}
        ${tile(this.number(offline), this.t("offline"), offline ? "sev-offline" : "")}
        ${unknown ? tile(this.number(unknown), this.t("unknown"), "sev-unknown") : nothing}
        ${
          battery
            ? tile(
                `${this.number(battery.value!)}${battery.unit ?? ""}`,
                this.t("lowestBattery"),
                battery.value! < this.config!.battery_warning
                  ? "sev-battery"
                  : "",
              )
            : nothing
        }
      </div>
    </div>`;
  }
  private renderTakeover(
    devices: AegisDevice[],
    alarms: Array<{ device: AegisDevice; alarm: HealthEntry }>,
    health: (d: AegisDevice) => DeviceHealth,
  ) {
    return html`<section class="takeover" aria-label=${this.t("alarm")}>
      <div class="takeover-head">
        <span class="icon">${icon("alarm")}</span
        ><strong>${this.t("alarm")}</strong>
      </div>
      ${alarms.map(
        ({ device, alarm }) =>
          html`<button
            data-alarm
            class="alarm-source"
            @click=${() => this.moreInfo(alarm.entityId)}
          >
            <span class="text"
              ><strong>${device.name}</strong
              ><span
                >${device.area?.name ?? this.t("noArea")} ·
                ${
                  alarm.state?.attributes.friendly_name ??
                  alarm.registry.name ??
                  (alarm.state?.attributes.device_class === "heat"
                    ? this.t("heat")
                    : this.t("smoke"))
                }</span
              ></span
            ><span class="timer"
              ><small>${this.t("detectedFor")}</small
              >${this.elapsed(alarm.state?.last_changed)}</span
            >
          </button>`,
      )}
      <div class="actions">
        ${devices
          .filter((device) => health(device).alarm.length)
          .map(
            (device) =>
              html`<button
                data-device=${device.id}
                @click=${() => this.details(device)}
              >
                ${this.t("details")}: ${device.name}
              </button>`,
          )}
      </div>
    </section>`;
  }
  private renderDevice(device: AegisDevice, h: DeviceHealth) {
    const severity = this.severity(h);
    const states = this.ha!.states;
    const temperatures = this.config!.show_temperature
      ? this.live(device.entities.temperature)
      : [];
    const lost = device.entities.connectivity
      .map((entity) => states[entity.entityId])
      .find(
        (state) => state?.state === "off" || state?.state === "unavailable",
      );
    const since = Date.parse(lost?.last_changed ?? "");
    const offlineHero = h.online === "offline" && Number.isFinite(since);
    const kinds = h.bypassed.flatMap((bypass) => bypass.deactivationKinds);
    const bypassNote = !h.bypassed.length
      ? undefined
      : h.bypassed.some((bypass) => bypass.wholeDevice)
        ? this.t("wholeDevice")
        : kinds.length && kinds.every((kind) => kind.includes("tamper"))
          ? this.t("tamperOnly")
          : this.t("caution");
    const tamperEntities = this.live(device.entities.tamper);
    const tamper = tamperEntities.map((e) => states[e.entityId]);
    const tamperValue = tamper.some((state) => state?.state === "on")
      ? this.t("triggered")
      : tamper.every((state) => state?.state === "off")
        ? this.t("intact")
        : this.reading(
            tamperEntities[tamper.findIndex((state) => state?.state !== "off")]
              .entityId,
          );
    const battery = this.batteryText(device, h);
    const tile = (label: string, value: string, severity = "") =>
      html`<div class="tile ${severity}">
        <span class="label">${label}</span> <span class="value">${value}</span>
      </div>`;
    const note = (text: string, severity: string) =>
      html`<p class="note ${severity}">${text}</p>`;
    return html`<div class="row head sev-${severity}">
        <button
          data-device=${device.id}
          class="pill"
          aria-label="${device.name}: ${this.t("details")}"
          @click=${() => this.details(device)}
        >
          <span class="icon">${icon(severity)}</span
          ><span class="text"
            ><strong>${device.name}</strong
            ><span class="sub"
              >${device.area?.name ?? this.t("noArea")}</span
            ></span
          ><span class="status">${this.statusLabel(h, severity)}</span>
        </button>
      </div>
      ${
        offlineHero
          ? html`<div class="hero sev-offline">
              <span class="label">${this.t("noContact")}</span>
              <span class="big">${this.duration(Date.now() - since)}</span>
            </div>`
          : temperatures.length
            ? html`<div class="hero">
                <span class="label">${this.t("temperature")}</span>
                <span class="big"
                  >${this.reading(temperatures[0].entityId)}</span
                >
              </div>`
            : nothing
      }
      ${
        h.online === "offline" && device.entities.alarm.length
          ? note(this.t("offlineNote"), "sev-offline")
          : nothing
      }
      ${bypassNote ? note(bypassNote, "sev-attention") : nothing}
      <div class="tiles">
        ${
          battery
            ? tile(
                this.t("battery"),
                battery,
                h.lowBattery.length ? "sev-battery" : "",
              )
            : nothing
        }
        ${this.live(device.entities.signal).map((e) =>
          tile(this.t("signal"), this.reading(e.entityId)),
        )}
        ${
          tamper.length
            ? tile(
                this.t("tamper"),
                tamperValue,
                h.tamper.length ? "sev-attention" : "",
              )
            : nothing
        }
        ${
          h.problem.length
            ? tile(this.t("problem"), this.t("triggered"), "sev-attention")
            : nothing
        }
        ${h.update.length ? tile(this.t("update"), this.t("on")) : nothing}
        ${temperatures
          .slice(offlineHero ? 0 : 1)
          .map((e) => tile(this.t("temperature"), this.reading(e.entityId)))}
        ${
          h.unknown.length
            ? tile(
                this.t("unknown"),
                this.number(h.unknown.length),
                "sev-unknown",
              )
            : nothing
        }
      </div>`;
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
    const healths = new Map(devices.map((d) => [d.id, this.health(d)]));
    const health = (device: AegisDevice) => healths.get(device.id)!;
    const sorted = [...devices].sort(
      (a, b) =>
        this.rank(health(a)) - this.rank(health(b)) ||
        a.name.localeCompare(b.name),
    );
    const alarms = devices.flatMap((device) =>
      health(device).alarm.map((alarm) => ({ device, alarm })),
    );
    const detail = devices.find((d) => d.id === this.detailId);
    const panel = this.config as PanelConfig;
    const disabledCount = devices.reduce(
      (sum, device) => sum + device.disabledCount,
      0,
    );
    const registryError = this.registry.disconnected
      ? this.t("disconnected")
      : this.registry.error
        ? `${this.t("error")}: ${this.registry.error}`
        : undefined;
    const title = this.config.title ?? (this.deviceCard ? undefined : "Aegis");
    return html`<ha-card
        class="${this.config.appearance} ${this.deviceCard ? "device-card" : "panel-card"}"
        >${title ? html`<h2>${title}</h2>` : nothing}
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
                        alarms.length
                          ? this.renderTakeover(devices, alarms, health)
                          : this.deviceCard
                            ? this.renderDevice(devices[0], health(devices[0]))
                            : html`${this.renderSummary(devices, health)}${this.renderList(sorted, health)}`
                      }
                      ${alarms.length ? nothing : this.renderActions(this.deviceCard ? devices[0] : undefined)}
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
