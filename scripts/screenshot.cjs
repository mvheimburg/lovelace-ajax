const { chromium } = require("playwright");
const { readFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 880, height: 720 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(`<style>
      body { margin: 0; padding: 34px; font: 14px Arial, sans-serif; color: #172033; background: linear-gradient(135deg, #e8eef8, #f6f8fb); --primary-color: #2563eb; --primary-text-color: #172033; --secondary-text-color: #64748b; --card-background-color: #fff; --secondary-background-color: #eff3f8; --divider-color: #d7deea; --bubble-main-background-color: #fff; --bubble-secondary-background-color: #eff3f8; --bubble-accent-color: #2563eb; --bubble-border-radius: 24px; --bubble-icon-border-radius: 16px; --bubble-icon-background-color: #e4ecfa; --bubble-sub-button-border-radius: 14px; --bubble-sub-button-background-color: #e8eef8; --bubble-border: 1px solid #d7deea; --bubble-box-shadow: 0 14px 42px #24324a20; }
      aegis-panel-card { display: block; width: 620px; margin: 0 auto; }
      ha-card { display: block; }
    </style>`);
    await page.addScriptTag({
      type: "module",
      content: readFileSync(resolve(root, "dist/aegis-panel-card.js"), "utf8"),
    });
    await page.evaluate(async () => {
      await customElements.whenDefined("aegis-panel-card");
      const devices = [
        { id: "hall", name: "Hall detector", area_id: "ground" },
        { id: "workshop", name: "Workshop detector", area_id: "ground" },
        { id: "bedroom", name: "Bedroom detector", area_id: "upstairs" },
        { id: "unrelated", name: "Unrelated KNX", area_id: "ground" },
      ];
      const entities = [];
      const states = {};
      const add = (
        device,
        domain,
        role,
        state,
        deviceClass,
        attributes = {},
      ) => {
        const entity_id = `${domain}.${device}_${role}`;
        entities.push({
          entity_id,
          platform: device === "unrelated" ? "knx" : "aegis_ajax",
          device_id: device,
          unique_id: `${device}_${role}`,
          labels: [],
        });
        states[entity_id] = {
          entity_id,
          state,
          attributes: { device_class: deviceClass, ...attributes },
        };
      };
      for (const [device, battery, temperature] of [
        ["hall", "91", "21.4"],
        ["workshop", "18", "17.8"],
        ["bedroom", "76", "20.6"],
      ]) {
        add(device, "binary_sensor", "smoke", "off", "smoke");
        add(device, "binary_sensor", "heat", "off", "heat");
        add(device, "binary_sensor", "tamper", "off", "tamper");
        add(device, "binary_sensor", "connectivity", "on", "connectivity");
        add(device, "sensor", "battery", battery, "battery", {
          unit_of_measurement: "%",
        });
        add(device, "sensor", "temperature", temperature, "temperature", {
          unit_of_measurement: "°C",
        });
        add(device, "sensor", "signal_strength", "-61", "signal_strength", {
          unit_of_measurement: "dBm",
        });
        add(device, "switch", "bypass", "off");
      }
      add("unrelated", "binary_sensor", "smoke", "on", "smoke");
      const registry = {
        entities,
        devices,
        areas: [
          { area_id: "ground", name: "Ground floor" },
          { area_id: "upstairs", name: "Upstairs" },
        ],
        labels: [],
      };
      const keys = {
        entity_registry: "entities",
        device_registry: "devices",
        area_registry: "areas",
        label_registry: "labels",
      };
      const connection = {
        connected: true,
        addEventListener() {},
        removeEventListener() {},
        sendMessagePromise: async ({ type }) =>
          registry[keys[type.split("/")[1]]],
        subscribeEvents: async () => () => {},
      };
      const card = document.createElement("aegis-panel-card");
      card.setConfig({
        type: "custom:aegis-panel-card",
        title: "Fire safety",
        appearance: "bubble",
        battery_warning: 20,
      });
      card.hass = { states, language: "en", connection };
      document.body.append(card);
    });
    await page.waitForFunction(() =>
      document
        .querySelector("aegis-panel-card")
        ?.shadowRoot?.textContent.includes("Workshop detector"),
    );
    if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
    mkdirSync(resolve(root, "docs"), { recursive: true });
    await page.screenshot({ path: resolve(root, "docs/aegis-panel.png") });
    console.log(
      "Wrote docs/aegis-panel.png from dist/aegis-panel-card.js with simulated Home Assistant data.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
