import { html, nothing } from "lit";
import { AegisCardBase } from "./card-base";
import type { AegisDevice, HassConnection } from "./types";
interface Target {
  entityId: string;
  deviceId: string;
  name: string;
  state: string;
  kinds: unknown;
}
interface Confirmation {
  deviceId?: string;
  restore: boolean;
  targets: Target[];
  config: string;
  connection: HassConnection;
}
/** Shared confirmed action boundary. Service responses never mutate HA state. */
export class AegisActionCard extends AegisCardBase {
  private confirmation?: Confirmation;
  private pending = false;
  private feedback = "";
  private targets(deviceId?: string): Target[] {
    if (
      !this.config?.allow_bypass ||
      !this.registry.snapshot ||
      this.registry.error ||
      !this.isConnected
    )
      return [];
    const devices = this.devices;
    if (this.deviceCard && devices.length !== 1) return [];
    return devices
      .filter((d) => !deviceId || d.id === deviceId)
      .flatMap((device) =>
        device.entities.bypass
          .filter((entity) => entity.entityId.startsWith("switch."))
          .flatMap((entity) => {
            const state = this.hass.states[entity.entityId];
            return state && (state.state === "on" || state.state === "off")
              ? [
                  {
                    entityId: entity.entityId,
                    deviceId: device.id,
                    name: device.name,
                    state: state.state,
                    kinds: state.attributes.deactivation_kinds ?? [],
                  },
                ]
              : [];
          }),
      );
  }
  private async ask(restore: boolean, device?: AegisDevice) {
    if (this.pending) return;
    const targets = this.targets(device?.id);
    if (!targets.length) return;
    this.confirmation = {
      deviceId: device?.id,
      restore,
      targets,
      config: JSON.stringify(this.config),
      connection: this.hass.connection,
    };
    this.feedback = "";
    this.requestUpdate();
    await this.updateComplete;
    this.shadowRoot!.querySelector<HTMLDialogElement>(
      "#confirmation",
    )!.showModal();
  }
  private valid(confirmation: Confirmation, remaining = confirmation.targets) {
    const current = new Map(
      this.targets(confirmation.deviceId).map((target) => [
        target.entityId,
        target,
      ]),
    );
    return (
      this.isConnected &&
      confirmation.connection === this.hass.connection &&
      confirmation.config === JSON.stringify(this.config) &&
      this.config?.allow_bypass === true &&
      remaining.every(
        (target) =>
          JSON.stringify(target) ===
          JSON.stringify(current.get(target.entityId)),
      )
    );
  }
  private cancel() {
    if (this.pending) return;
    this.shadowRoot!.querySelector<HTMLDialogElement>("#confirmation")!.close();
    this.confirmation = undefined;
    this.requestUpdate();
  }
  private async execute() {
    const confirmation = this.confirmation;
    if (!confirmation || this.pending) return;
    if (!this.valid(confirmation)) {
      this.feedback = this.t("changed");
      this.cancel();
      this.requestUpdate();
      return;
    }
    this.pending = true;
    this.requestUpdate();
    const failures: string[] = [];
    for (const [index, target] of confirmation.targets.entries()) {
      // Completed calls may already have published new HA state. Only the
      // unprocessed confirmed targets must still match their captured readings.
      if (!this.valid(confirmation, confirmation.targets.slice(index))) {
        failures.push(this.t("changed"));
        break;
      }
      try {
        if (!this.hass.callService)
          throw new Error("Home Assistant service API unavailable");
        await this.hass.callService(
          "switch",
          confirmation.restore ? "turn_off" : "turn_on",
          { entity_id: target.entityId },
        );
      } catch (error) {
        failures.push(
          `${target.name}: ${error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : String(error)}`,
        );
      }
    }
    this.pending = false;
    this.feedback = failures.length
      ? `${this.t("failed")}: ${failures.join("; ")}`
      : this.t("sent");
    this.cancel();
    this.requestUpdate();
  }
  protected renderActions(device?: AegisDevice) {
    if (!this.config?.allow_bypass || !this.targets(device?.id).length)
      return nothing;
    return html`<div class="actions">
      <button
        data-bypass
        ?disabled=${this.pending}
        @click=${() => this.ask(false, device)}
      >
        ${this.t(device ? "bypass" : "bypassAll")}</button
      ><button
        data-restore
        ?disabled=${this.pending}
        @click=${() => this.ask(true, device)}
      >
        ${this.t(device ? "restore" : "restoreAll")}
      </button>
    </div>`;
  }
  protected renderFeedback() {
    return this.feedback
      ? html`<p class="feedback" role="status">${this.feedback}</p>`
      : nothing;
  }
  protected renderConfirmation() {
    const scope = this.confirmation;
    return html`<dialog
      id="confirmation"
      aria-labelledby="confirm-title"
      @cancel=${(event: Event) => {
        if (this.pending) event.preventDefault();
        else this.confirmation = undefined;
      }}
    >
      <h2 id="confirm-title">
        ${this.t(scope?.restore ? "restore" : "bypass")}
      </h2>
      ${
        scope
          ? html`<p>${this.t("scope")}: ${scope.targets.length}</p>
              <p>
                ${this.t("selection")}:
                ${[...new Set(scope.targets.map((target) => target.name))].join(", ")}
              </p>
              <p>${this.t("caution")}</p>
              ${scope.targets.map((target) => html`<p>${target.name} — ${target.entityId}<br />${this.t("deactivation")}: ${Array.isArray(target.kinds) && target.kinds.length ? target.kinds.join(", ") : this.t("unknown")}</p>`)}`
          : nothing
      }
      <div class="actions">
        <button data-cancel ?disabled=${this.pending} @click=${this.cancel}>
          ${this.t("cancel")}</button
        ><button data-confirm ?disabled=${this.pending} @click=${this.execute}>
          ${this.t(this.pending ? "pending" : "confirm")}
        </button>
      </div>
    </dialog>`;
  }
}
