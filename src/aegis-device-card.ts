import { AegisActionCard } from "./actions";
export class AegisDeviceCard extends AegisActionCard {
  protected deviceCard = true;
  static getConfigElement() {
    return document.createElement("aegis-device-card-editor");
  }
  static getStubConfig() {
    return { type: "custom:aegis-device-card", device: "" };
  }
}
customElements.define("aegis-device-card", AegisDeviceCard);
