import { css } from "lit";
export const styles = css`
  :host {
    display: block;
    color: var(--primary-text-color, #242c38);
    font-family: var(--paper-font-body1_-_font-family, system-ui);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: block;
    padding: 20px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, #ddd);
    border-radius: var(--ha-card-border-radius, 16px);
    box-shadow: var(--ha-card-box-shadow);
  }
  .bubble {
    background: var(
      --bubble-main-background-color,
      var(--ha-card-background, #fff)
    );
    border: var(--bubble-border, none);
    border-radius: var(--bubble-border-radius, 32px);
    box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow));
  }
  .bubble .device {
    background: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f5f8)
    );
    border-radius: var(--bubble-sub-button-border-radius, 20px);
  }
  .bubble .symbol {
    background: var(--bubble-icon-background-color, #e6eaf0);
    border-radius: var(--bubble-icon-border-radius, 50%);
    color: var(--bubble-accent-color, var(--primary-color, #03a9f4));
  }
  .bubble .actions button {
    background: var(
      --bubble-sub-button-background-color,
      var(--secondary-background-color, #eef1f5)
    );
    border-radius: var(--bubble-sub-button-border-radius, 18px);
  }
  h2 {
    font-size: 1.25rem;
    margin: 0 0 8px;
  }
  h3 {
    font-size: 1rem;
    margin: 18px 0 8px;
  }
  p {
    line-height: 1.5;
  }
  .summary {
    color: var(--secondary-text-color, #526071);
    font-size: 0.9rem;
    line-height: 1.65;
    margin-bottom: 16px;
  }
  .device {
    width: 100%;
    text-align: left;
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 8px 0;
    padding: 14px;
    background: var(--secondary-background-color, #f6f7fa);
    border: 1px solid transparent;
    border-radius: 12px;
    color: inherit;
  }
  .symbol {
    flex: 0 0 40px;
    height: 40px;
    display: grid;
    place-items: center;
    background: #e6eaf0;
    border-radius: 50%;
    font-size: 1.3rem;
  }
  .device strong {
    display: block;
  }
  .device > span:last-child {
    min-width: 0;
  }
  .readings {
    font-size: 0.85rem;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    line-height: 1.6;
    margin-top: 4px;
  }
  .chip {
    border-radius: 999px;
    padding: 2px 8px;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #d8dce2);
    overflow-wrap: anywhere;
  }
  .alarm-chip {
    color: #a51414;
    background: #fff0f0;
    border-color: #d44848;
  }
  .attention-chip {
    color: #7a4300;
    background: #fff3d9;
    border-color: #c68a25;
  }
  .device-group {
    border: 1px solid var(--divider-color, #d8dce2);
    border-radius: 16px;
    padding: 8px;
    margin: 12px 0;
  }
  .device-group .device {
    margin: 0;
  }
  .disabled-notice {
    font-size: 0.8rem;
  }
  .alarm {
    border-left: 5px solid var(--error-color, #c62828) !important;
  }
  .tamper {
    border-left: 5px solid var(--warning-color, #b36a00) !important;
  }
  .takeover {
    background: var(--error-color, #ba1a1a);
    color: white;
    border-radius: 12px;
    padding: 16px;
    margin: 12px 0;
  }
  .takeover button {
    overflow-wrap: anywhere;
    white-space: normal;
    color: inherit;
    text-align: left;
    background: transparent;
    border: 1px solid currentColor;
    width: 100%;
    margin-top: 8px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  button {
    font: inherit;
    cursor: pointer;
    border: 1px solid var(--divider-color, #aab1bc);
    border-radius: 10px;
    padding: 10px 14px;
    color: inherit;
    background: var(--card-background-color, #fff);
    min-height: 44px;
  }
  button:disabled {
    opacity: 0.55;
    cursor: wait;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 3px solid var(--primary-color, #0277bd);
    outline-offset: 3px;
  }
  a {
    color: var(--primary-color, #0277bd);
  }
  dialog {
    color: var(--primary-text-color, #242c38);
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 18px;
    padding: 24px;
    width: min(560px, calc(100vw - 24px));
    max-height: 85dvh;
    overflow: auto;
    box-shadow: 0 16px 60px #0006;
  }
  dialog::backdrop {
    background: #0007;
  }
  .entity {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    margin: 6px 0;
    text-align: left;
    overflow-wrap: anywhere;
  }
  .feedback {
    padding: 10px;
    background: var(--secondary-background-color, #eef1f5);
    border-radius: 8px;
    overflow-wrap: anywhere;
  }
  .muted {
    color: var(--secondary-text-color, #526071);
  }
  @media (max-width: 400px) {
    ha-card {
      padding: 14px;
    }
    .device {
      padding: 10px;
    }
    .actions button {
      flex: 1;
    }
    dialog {
      padding: 16px;
    }
  }
`;
