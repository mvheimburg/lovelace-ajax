import { css } from "lit";
export const styles = css`
  :host {
    display: block;
    color: var(--primary-text-color, #1b1b1a);
    font-family: var(--paper-font-body1_-_font-family, system-ui);
    --aegis-text: var(--primary-text-color, #1b1b1a);
    --aegis-muted: var(--secondary-text-color, #5b5a55);
    --aegis-ok: var(--success-color, #2e7d32);
    --aegis-warn: var(--warning-color, #f59e0b);
    --aegis-offline: var(--orange-color, #ea580c);
    --aegis-alarm: var(--error-color, #c62828);
    --aegis-neutral: var(--disabled-text-color, #8a8984);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    --aegis-surface: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
    --aegis-pill: var(--secondary-background-color, #f3f2ee);
    --aegis-pill-radius: 20px;
    --aegis-tile-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    container-type: inline-size;
    background: var(--aegis-surface);
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    border-radius: var(--ha-card-border-radius, 16px);
    box-shadow: var(--ha-card-box-shadow);
  }
  ha-card.bubble {
    --aegis-surface: var(
      --bubble-main-background-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --aegis-pill: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f2ee)
    );
    --aegis-pill-radius: var(--bubble-border-radius, 32px);
    --aegis-tile-radius: var(--bubble-sub-button-border-radius, 22px);
    border: var(--bubble-border, none);
    border-radius: var(--bubble-border-radius, 32px);
    box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow));
  }
  .sev-ok {
    --sev: var(--aegis-ok);
  }
  .sev-attention,
  .sev-battery {
    --sev: var(--aegis-warn);
  }
  .sev-offline {
    --sev: var(--aegis-offline);
  }
  .sev-alarm {
    --sev: var(--aegis-alarm);
  }
  .sev-unknown {
    --sev: var(--aegis-neutral);
  }
  h2 {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0 4px;
  }
  h3 {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--aegis-muted);
    margin: 4px 8px 8px;
  }
  p {
    line-height: 1.5;
    margin: 0;
  }
  .summary {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .overview {
    color: var(--aegis-muted);
    font-size: 0.9rem;
    margin: -6px 4px 0;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
    gap: 6px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 14px;
    border-radius: var(--aegis-tile-radius);
    background: var(--aegis-pill);
    min-width: 0;
  }
  .tile[class*="sev-"]:not(.sev-ok) {
    background: color-mix(in srgb, var(--sev) 16%, var(--aegis-pill));
  }
  .summary .tile .value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .summary .tile.sev-ok .value,
  .summary .tile.sev-offline .value {
    color: color-mix(in srgb, var(--sev) 70%, var(--aegis-text));
  }
  .tile .label {
    font-size: 0.78rem;
    color: var(--aegis-muted);
  }
  .device-card .tile .value {
    font-size: 1.05rem;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .group {
    display: flex;
    flex-direction: column;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    border-radius: var(--aegis-pill-radius);
    background: var(--aegis-pill);
  }
  .row.wide {
    grid-column: 1 / -1;
  }
  .row.sev-offline,
  .row.sev-alarm {
    background: color-mix(in srgb, var(--sev) 16%, var(--aegis-pill));
  }
  .pill {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 60px;
    padding: 6px 12px 6px 6px;
    text-align: left;
    border: 0;
    border-radius: var(--aegis-pill-radius);
    background: none;
  }
  .icon {
    flex: 0 0 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: var(--bubble-icon-border-radius, 50%);
    color: color-mix(in srgb, var(--sev) 75%, var(--aegis-text));
    background: color-mix(in srgb, var(--sev) 20%, transparent);
  }
  .icon svg {
    width: 24px;
    height: 24px;
  }
  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .text strong {
    font-size: 0.98rem;
    overflow-wrap: anywhere;
  }
  .sub {
    font-size: 0.83rem;
    color: var(--aegis-muted);
    line-height: 1.4;
  }
  .chip {
    overflow-wrap: anywhere;
  }
  .alarm-chip,
  .attention-chip,
  .offline-chip {
    font-weight: 700;
    color: var(--aegis-text);
  }
  .row-action {
    flex: 0 0 auto;
    margin-right: 6px;
    border-radius: var(--aegis-pill-radius);
    background: color-mix(in srgb, var(--aegis-warn) 30%, var(--aegis-surface));
    font-weight: 700;
  }
  .device-group .grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .status {
    flex: 0 0 auto;
    display: inline-block;
    padding: 6px 11px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    background: color-mix(in srgb, var(--sev) 22%, transparent);
    color: color-mix(in srgb, var(--sev) 60%, var(--aegis-text));
  }
  .status::first-letter {
    text-transform: uppercase;
  }
  .head .pill {
    min-height: 64px;
  }
  .head .icon {
    flex-basis: 52px;
    height: 52px;
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 8px 0;
  }
  .hero .label {
    font-size: 0.8rem;
    color: var(--aegis-muted);
  }
  .hero .big {
    font-size: 2.6rem;
    font-weight: 800;
    line-height: 1.05;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  .hero.sev-offline .big {
    font-size: 2rem;
    color: color-mix(in srgb, var(--sev) 70%, var(--aegis-text));
  }
  .note {
    font-size: 0.88rem;
    padding: 12px 14px;
    border-radius: var(--aegis-tile-radius);
    background: color-mix(in srgb, var(--sev) 16%, var(--aegis-pill));
  }
  .disabled-notice {
    font-size: 0.8rem;
    margin: 0 4px;
  }
  .takeover {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--aegis-alarm);
    color: #fff;
    border-radius: var(--aegis-pill-radius);
    padding: 16px;
  }
  .takeover-head {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.4rem;
    font-weight: 800;
  }
  .takeover .icon {
    color: var(--aegis-alarm);
    background: #fff;
  }
  .takeover button {
    color: inherit;
    background: rgb(0 0 0 / 0.2);
    border: 1px solid rgb(255 255 255 / 0.45);
  }
  .alarm-source {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    white-space: normal;
    overflow-wrap: anywhere;
    border-radius: var(--aegis-tile-radius);
  }
  .timer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 1.5rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .timer small {
    font-size: 0.7rem;
    font-weight: 500;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .actions button {
    flex: 1 1 auto;
  }
  .actions button.primary {
    font-weight: 700;
    background: color-mix(in srgb, var(--aegis-warn) 35%, var(--aegis-surface));
  }
  button {
    font: inherit;
    cursor: pointer;
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    color: inherit;
    background: var(--aegis-pill, var(--secondary-background-color, #f3f2ee));
    min-height: 44px;
  }
  .pill:hover,
  .entity:hover {
    background: color-mix(in srgb, var(--aegis-text) 5%, transparent);
  }
  button:disabled {
    opacity: 0.55;
    cursor: wait;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 3px solid var(--primary-color, #0277bd);
    outline-offset: 2px;
  }
  a {
    color: var(--primary-color, #0277bd);
  }
  dialog {
    color: var(--primary-text-color, #1b1b1a);
    background: var(--card-background-color, #fff);
    border: 0;
    border-radius: 24px;
    padding: 24px;
    width: min(520px, calc(100vw - 24px));
    max-height: 85dvh;
    overflow: auto;
    box-shadow: 0 16px 60px #0006;
  }
  dialog h2 {
    margin: 0 0 8px;
  }
  dialog h3 {
    margin: 16px 4px 6px;
  }
  dialog p {
    margin: 8px 0;
  }
  dialog .actions {
    margin-top: 16px;
  }
  dialog::backdrop {
    background: #0007;
  }
  .entity {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    margin: 4px 0;
    text-align: left;
    border-radius: 14px;
    background: var(--secondary-background-color, #f3f2ee);
    overflow-wrap: anywhere;
  }
  .feedback {
    padding: 10px 14px;
    background: var(--aegis-pill, var(--secondary-background-color, #f3f2ee));
    border-radius: 14px;
    overflow-wrap: anywhere;
  }
  .muted {
    color: var(--aegis-muted);
  }
  @container (max-width: 340px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .row.wide {
      flex-wrap: wrap;
    }
    .row-action {
      margin: 0 6px 6px auto;
    }
  }
  @media (max-width: 400px) {
    ha-card {
      padding: 12px;
    }
    dialog {
      padding: 16px;
    }
  }
`;
