const { chromium } = require("playwright");
const { readFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");

const light = `--primary-text-color: #1b1b1a; --secondary-text-color: #5b5a55; --card-background-color: #fff; --secondary-background-color: #f3f2ee; --divider-color: #e4e2dc; --primary-color: #1d4ed8; background: #eeede9;`;
const dark = `--primary-text-color: #ecebe8; --secondary-text-color: #a9a8a3; --card-background-color: #1a1c20; --secondary-background-color: #25272c; --divider-color: #2f3137; --primary-color: #8ab4f8; --bubble-main-background-color: #1a1c20; --bubble-secondary-background-color: #25272c; --bubble-border-radius: 32px; --bubble-sub-button-border-radius: 22px; background: #121316;`;

/** Simulated registries and states: no live Home Assistant is involved. */
function simulate() {
  const now = Date.now();
  const ago = (minutes) => new Date(now - minutes * 60000).toISOString();
  const devices = [
    { id: "hub", name: "Hub", area_id: "technical" },
    { id: "plant", name: "Plant room", area_id: "technical" },
    { id: "garage", name: "Garage", area_id: "garage" },
    { id: "kitchen", name: "Kitchen", area_id: "ground" },
    { id: "living", name: "Living room", area_id: "ground" },
    { id: "bath", name: "Bathroom", area_id: "ground" },
    { id: "bedroom", name: "Bedroom", area_id: "upstairs" },
    { id: "bedroom2", name: "Bedroom 2", area_id: "upstairs" },
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
    changed = 600,
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
      last_changed: ago(changed),
      attributes: { device_class: deviceClass, ...attributes },
    };
  };
  const detector = (
    id,
    {
      online = true,
      battery = "100",
      temperature,
      signal = "-58",
      bypass = "off",
      kinds = [],
      smoke = "off",
      smokeAgo = 600,
    },
  ) => {
    const value = (reading) => (online ? reading : "unavailable");
    add(id, "binary_sensor", "smoke", value(smoke), "smoke", {}, smokeAgo);
    add(id, "binary_sensor", "tamper", value("off"), "tamper");
    add(
      id,
      "binary_sensor",
      "connectivity",
      online ? "on" : "off",
      "connectivity",
      {},
      online ? 600 : 192,
    );
    add(id, "sensor", "battery", value(battery), "battery", {
      unit_of_measurement: "%",
    });
    if (temperature)
      add(id, "sensor", "temperature", value(temperature), "temperature", {
        unit_of_measurement: "°C",
      });
    add(id, "sensor", "signal_strength", value(signal), "signal_strength", {
      unit_of_measurement: "dBm",
    });
    add(
      id,
      "switch",
      "bypass",
      value(bypass),
      undefined,
      { deactivation_kinds: kinds },
      120,
    );
  };
  add("hub", "binary_sensor", "connectivity", "off", "connectivity", {}, 192);
  add("hub", "sensor", "battery", "unavailable", "battery", {
    unit_of_measurement: "%",
  });
  detector("plant", { online: false, temperature: "20.8" });
  detector("garage", {
    temperature: "23.0",
    bypass: "on",
    kinds: ["permanent_tamper"],
    signal: "-81",
  });
  detector("kitchen", { temperature: "21.4" });
  detector("living", { temperature: "22.1", battery: "91" });
  detector("bath", { temperature: "24.0" });
  detector("bedroom", { temperature: "19.8", battery: "97" });
  detector("bedroom2", { temperature: "20.2", battery: "14" });
  add("unrelated", "binary_sensor", "smoke", "on", "smoke");
  const registry = {
    entities,
    devices,
    areas: [
      { area_id: "technical", name: "Technical" },
      { area_id: "garage", name: "Garage" },
      { area_id: "ground", name: "Ground floor" },
      { area_id: "upstairs", name: "Upstairs" },
    ],
    labels: [],
  };
  return { registry, states };
}

async function render(browser, errors, { width, height, theme, cards }) {
  // A fresh page per shot: custom elements can be defined only once.
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<style>
    body { margin: 0; padding: 28px; font: 15px system-ui, sans-serif; ${theme} }
    main { display: flex; gap: 24px; align-items: flex-start; }
    main > * { display: block; flex: 0 0 auto; }
  </style><main></main>`);
  await page.addScriptTag({
    type: "module",
    content: readFileSync(resolve(root, "dist/aegis-panel-card.js"), "utf8"),
  });
  await page.evaluate(
    async ({ data, cards }) => {
      await customElements.whenDefined("aegis-panel-card");
      for (const { tag, config, width, tweak } of cards) {
        const { registry, states } = structuredClone(data);
        for (const [entity, state] of Object.entries(tweak ?? {}))
          states[entity] = { ...states[entity], ...state };
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
        const card = document.createElement(tag);
        card.style.width = `${width}px`;
        card.setConfig(config);
        card.hass = { states, language: "en", connection };
        document.querySelector("main").append(card);
      }
    },
    { data: simulate(), cards },
  );
  await page.waitForFunction(
    (count) =>
      [...document.querySelectorAll("main > *")].filter((card) =>
        card.shadowRoot?.querySelector("[data-device], [data-alarm]"),
      ).length === count,
    cards.length,
  );
  return page;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const errors = [];
    mkdirSync(resolve(root, "docs"), { recursive: true });

    const panel = await render(browser, errors, {
      width: 1000,
      height: 900,
      theme: light,
      cards: [
        {
          tag: "aegis-panel-card",
          width: 440,
          config: {
            type: "custom:aegis-panel-card",
            title: "Fire safety",
            allow_bypass: true,
          },
        },
        {
          tag: "aegis-panel-card",
          width: 440,
          config: {
            type: "custom:aegis-panel-card",
            title: "Fire safety",
            group_by: "none",
          },
        },
      ],
    });
    await panel.screenshot({
      path: resolve(root, "docs/aegis-panel.png"),
      fullPage: true,
    });

    const device = (id, extra = {}) => ({
      tag: "aegis-device-card",
      width: 340,
      config: {
        type: "custom:aegis-device-card",
        device: id,
        appearance: "bubble",
        allow_bypass: true,
      },
      ...extra,
    });
    const cards = await render(browser, errors, {
      width: 1500,
      height: 640,
      theme: dark,
      cards: [
        device("kitchen"),
        device("garage"),
        device("plant"),
        device("kitchen", {
          tweak: {
            "binary_sensor.kitchen_smoke": {
              state: "on",
              last_changed: new Date(Date.now() - 134000).toISOString(),
            },
          },
        }),
      ],
    });
    await cards.screenshot({
      path: resolve(root, "docs/aegis-device.png"),
      fullPage: true,
    });

    if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
    console.log(
      "Wrote docs/aegis-panel.png and docs/aegis-device.png from dist/aegis-panel-card.js with simulated Home Assistant data.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
