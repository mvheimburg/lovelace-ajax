import { AegisActionCard } from "./actions";
import "./aegis-device-card";
import "./editors";
export class AegisPanelCard extends AegisActionCard {
  static getConfigElement() {
    return document.createElement("aegis-panel-card-editor");
  }
  static getStubConfig() {
    return { type: "custom:aegis-panel-card" };
  }
}
customElements.define("aegis-panel-card", AegisPanelCard);
const registry = window as unknown as {
  customCards: Array<Record<string, unknown>>;
};
registry.customCards ??= [];
registry.customCards.push(
  {
    type: "aegis-panel-card",
    name: "Aegis Panel",
    description: "Aegis for Ajax device overview",
    preview: true,
  },
  {
    type: "aegis-device-card",
    name: "Aegis Device",
    description: "Aegis for Ajax device details",
    preview: true,
  },
);
