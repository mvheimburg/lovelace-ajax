import { afterEach, describe, expect, it } from "vitest";
import { fixture, settle, click } from "./card-fixtures";
import { snapshot } from "./fixtures";
// Registration must make real Lovelace custom elements usable.
import "../src/aegis-panel-card";
type Card = HTMLElement & {
  setConfig(config: Record<string, unknown>): void;
  hass: ReturnType<typeof fixture>;
};
afterEach(() => document.body.replaceChildren());
async function mount(
  config: Record<string, unknown> = {},
  device = false,
  hass = fixture(),
) {
  const card = document.createElement(
    device ? "aegis-device-card" : "aegis-panel-card",
  ) as Card;
  card.setConfig(config);
  card.hass = hass;
  document.body.append(card);
  await settle();
  return card;
}
describe("Lovelace cards", () => {
  it("groups one physical Aegis device, excludes KNX, and opens all enabled details", async () => {
    const card = await mount({ appearance: "bubble" });
    const root = card.shadowRoot!;
    expect(root.querySelectorAll("[data-device]")).toHaveLength(1);
    expect(root.textContent).toContain("Workshop area");
    expect(root.textContent).not.toContain("Hall KNX");
    expect(root.textContent).toContain("19.2");
    click(root, "[data-device]");
    await settle();
    expect(root.querySelector("dialog[open]")?.textContent).toContain("Other");
    expect(root.querySelector("dialog")?.textContent).toContain(
      "button.workshop_identify",
    );
    expect(
      root.querySelector('a[href="/config/entities"]')?.textContent,
    ).toContain("1");
  });
  it("hides temperature on request and distinguishes unknown connectivity", async () => {
    const hass = fixture();
    delete hass.states["binary_sensor.workshop_connectivity"];
    const card = await mount({ show_temperature: false }, false, hass);
    expect(card.shadowRoot!.textContent).not.toContain("19.2");
    expect(card.shadowRoot!.textContent).toContain("1 unknown");
    expect(card.shadowRoot!.textContent).not.toContain("1 online");
  });
  it("reports ambiguous selection and accepts exact IDs", async () => {
    const registry = structuredClone(snapshot);
    registry.devices.push({ ...registry.devices[0], id: "duplicate" });
    registry.entities.push({
      ...registry.entities[0],
      device_id: "duplicate",
      entity_id: "binary_sensor.duplicate",
    });
    const card = await mount({ device: "Workshop" }, true, fixture(registry));
    expect(card.shadowRoot!.textContent).toContain("ambiguous");
    card.setConfig({ device: "ajax-workshop" });
    await settle();
    expect(card.shadowRoot!.querySelectorAll("[data-device]")).toHaveLength(1);
  });
  it("shows every active detector during takeover while keeping details accessible", async () => {
    const hass = fixture();
    hass.states["binary_sensor.workshop_smoke"].state = "on";
    hass.states["binary_sensor.workshop_heat"].state = "on";
    const card = await mount({}, false, hass);
    expect(card.shadowRoot!.querySelectorAll("[data-alarm]")).toHaveLength(2);
    click(card.shadowRoot!, "[data-device]");
    await settle();
    expect(card.shadowRoot!.querySelector("dialog[open]")).not.toBeNull();
  });
  it("uses native more-info for a valid alarm panel only", async () => {
    const hass = fixture();
    hass.states["alarm_control_panel.home"] = {
      entity_id: "alarm_control_panel.home",
      state: "disarmed",
      attributes: {},
    };
    const card = await mount(
      { alarm_entity: "alarm_control_panel.home" },
      false,
      hass,
    );
    let entity = "";
    card.addEventListener("hass-more-info", (event) => {
      entity = (event as CustomEvent).detail.entityId;
    });
    click(card.shadowRoot!, "[data-alarm-control]");
    expect(entity).toBe("alarm_control_panel.home");
  });
});
it("groups areas once, orders severe groups first and disables headings in none mode", async () => {
  const registry = structuredClone(snapshot);
  registry.devices.push(
    { id: "a", name: "A quiet", area_id: "hall" },
    { id: "z", name: "Z alarm", area_id: "hall" },
    { id: "m", name: "M trouble", area_id: "workshop" },
  );
  const hass = fixture(registry);
  for (const [id, state, role] of [
    ["a", "off", "smoke"],
    ["z", "on", "problem"],
    ["m", "on", "battery"],
  ]) {
    const entity_id = `binary_sensor.${id}`;
    registry.entities.push({
      entity_id,
      platform: "aegis_ajax",
      device_id: id,
      unique_id: id,
      labels: [],
    });
    hass.states[entity_id] = {
      entity_id,
      state,
      attributes: { device_class: role },
    };
  }
  const card = await mount({}, false, hass);
  const root = card.shadowRoot!;
  expect(
    Array.from(root.querySelectorAll("ha-card h3")).map((e) => e.textContent),
  ).toEqual(["Hall", "Workshop area"]);
  expect(
    Array.from(root.querySelectorAll("[data-device]")).map((e) =>
      e.getAttribute("data-device"),
    ),
  ).toEqual(["z", "a", "m", "ajax-workshop"]);
  card.setConfig({ group_by: "none" });
  await settle();
  expect(root.querySelector("ha-card h3")).toBeNull();
  expect(
    Array.from(root.querySelectorAll("[data-device]")).map((e) =>
      e.getAttribute("data-device"),
    ),
  ).toEqual(["z", "m", "a", "ajax-workshop"]);
});
it("refreshes elapsed time without hass assignments", async () => {
  const hass = fixture();
  hass.states["binary_sensor.workshop_smoke"].state = "on";
  hass.states["binary_sensor.workshop_smoke"].last_changed = new Date(
    Date.now() - 1000,
  ).toISOString();
  const card = await mount({}, false, hass);
  const before = card.shadowRoot!.querySelector("[data-alarm]")!.textContent;
  await new Promise((resolve) => setTimeout(resolve, 1100));
  expect(card.shadowRoot!.querySelector("[data-alarm]")!.textContent).not.toBe(
    before,
  );
});
it("offers recovery after initial registry failures and cleans subscriptions on replacement and detach", async () => {
  const hass = fixture();
  const send = hass.connection.sendMessagePromise.bind(hass.connection);
  let failed = true,
    stops = 0;
  hass.connection.sendMessagePromise = async (message) => {
    if (failed) throw new Error("Network down");
    return send(message);
  };
  hass.connection.subscribeEvents = async () => () => {
    stops++;
  };
  const card = await mount({}, false, hass);
  expect(card.shadowRoot!.textContent).toContain("Network down");
  expect(card.shadowRoot!.textContent).not.toContain("1 online");
  failed = false;
  const retry = Array.from(card.shadowRoot!.querySelectorAll("button")).find(
    (b) => b.textContent === "Retry",
  )!;
  retry.click();
  await settle();
  expect(card.shadowRoot!.querySelectorAll("[data-device]")).toHaveLength(1);
  expect(stops).toBe(0);
  card.hass = fixture();
  await settle();
  expect(stops).toBe(4);
  card.remove();
});
it("shows offline distinctly, localizes Bokmål and dispatches entity detail events", async () => {
  const hass = fixture();
  hass.language = "nb";
  hass.states["binary_sensor.workshop_connectivity"].state = "off";
  const card = await mount({}, false, hass);
  expect(card.shadowRoot!.textContent).toContain("1 frakoblet");
  expect(card.shadowRoot!.textContent).toContain("0 tilkoblet");
  expect(card.shadowRoot!.querySelector(".row.sev-offline")).not.toBeNull();
  let entity = "";
  card.addEventListener("hass-more-info", (event) => {
    entity = (event as CustomEvent).detail.entityId;
  });
  click(card.shadowRoot!, "[data-device]");
  await settle();
  click(card.shadowRoot!, "#details .entity");
  expect(entity).toBe("binary_sensor.workshop_smoke");
});
it("recovers all cards sharing a failed registry watcher from one Retry", async () => {
  const hass = fixture();
  const send = hass.connection.sendMessagePromise.bind(hass.connection);
  let failed = true;
  hass.connection.sendMessagePromise = async (message) => {
    if (failed) throw new Error("Initial failure");
    return send(message);
  };
  const first = await mount({}, false, hass);
  const second = await mount({}, false, hass);
  failed = false;
  Array.from(first.shadowRoot!.querySelectorAll("button"))
    .find((button) => button.textContent?.trim() === "Retry")!
    .click();
  await settle();
  expect(first.shadowRoot!.querySelectorAll("[data-device]")).toHaveLength(1);
  expect(second.shadowRoot!.querySelectorAll("[data-device]")).toHaveLength(1);
});
it("keeps loading and empty states separate and validates unsafe configuration", async () => {
  const pending = fixture();
  pending.connection.sendMessagePromise = () => new Promise(() => {});
  const card = await mount({}, false, pending);
  expect(card.shadowRoot!.textContent).toContain("Loading");
  expect(card.shadowRoot!.querySelector(".summary")).toBeNull();
  card.hass = fixture({ devices: [], entities: [], areas: [], labels: [] });
  await settle();
  expect(card.shadowRoot!.textContent).toContain("No Aegis devices");
  expect(() => card.setConfig({ allow_bypass: "true" })).toThrow("boolean");
  expect(() => card.setConfig({ battery_warning: 101 })).toThrow("0–100");
  expect(() => card.setConfig({ appearance: "invalid" })).toThrow("appearance");
  expect(() => card.setConfig({ alarm_entity: "switch.alarm" })).toThrow(
    "alarm_control_panel",
  );
  card.setConfig({ battery_warning: 0 });
});
it("shows no-match device guidance and omits nonexistent alarm controls", async () => {
  const card = await mount({ device: "missing" }, true);
  expect(card.shadowRoot!.textContent).toContain("No matching Aegis device");
  expect(card.shadowRoot!.querySelector("[data-device]")).toBeNull();
  const panel = await mount({ alarm_entity: "alarm_control_panel.missing" });
  expect(panel.shadowRoot!.querySelector("[data-alarm-control]")).toBeNull();
});
it("returns keyboard focus to the device row after closing details", async () => {
  const card = await mount();
  const row =
    card.shadowRoot!.querySelector<HTMLButtonElement>("[data-device]")!;
  row.focus();
  row.click();
  await settle();
  const dialog = card.shadowRoot!.querySelector<HTMLDialogElement>("#details")!;
  expect(dialog.open).toBe(true);
  Array.from(dialog.querySelectorAll("button"))
    .find((button) => button.textContent?.trim() === "Close")!
    .click();
  await settle();
  expect(dialog.open).toBe(false);
  expect(card.shadowRoot!.activeElement).toBe(row);
});
it("alarm takeover removes quiet rows, retains alarm details, and wraps detector text", async () => {
  const registry = structuredClone(snapshot);
  registry.devices.push({ id: "quiet", name: "Quiet room", area_id: "hall" });
  registry.entities.push({
    entity_id: "binary_sensor.quiet",
    platform: "aegis_ajax",
    device_id: "quiet",
    unique_id: "quiet",
    labels: [],
  });
  const hass = fixture(registry);
  hass.states["binary_sensor.workshop_smoke"].state = "on";
  hass.states["binary_sensor.workshop_smoke"].attributes.friendly_name =
    "An exceptionally long detector name that must fit a small mobile screen";
  const card = await mount({}, false, hass);
  expect(card.shadowRoot!.querySelector('[data-device="quiet"]')).toBeNull();
  expect(
    card.shadowRoot!.querySelector('[data-device="ajax-workshop"]'),
  ).not.toBeNull();
  expect(card.shadowRoot!.querySelector(".summary")).toBeNull();
});
it("surfaces disabled monitoring and readable status chips without opening details", async () => {
  const card = await mount();
  expect(
    card.shadowRoot!.querySelector('ha-card a[href="/config/entities"]')
      ?.textContent,
  ).toContain("1");
  expect(
    Array.from(card.shadowRoot!.querySelectorAll(".chip")).some((chip) =>
      chip.textContent?.includes("Battery"),
    ),
  ).toBe(true);
  card.setConfig({ group_by: "device" });
  await settle();
  expect(card.shadowRoot!.querySelector("[data-device-group]")).not.toBeNull();
  card.setConfig({ group_by: "none" });
  await settle();
  expect(card.shadowRoot!.querySelector("[data-device-group]")).toBeNull();
});
it("preserves the lowest battery reading unit in the system summary", async () => {
  const hass = fixture();
  hass.states["sensor.workshop_battery_level"].attributes.unit_of_measurement =
    "mV";
  const card = await mount({}, false, hass);
  expect(card.shadowRoot!.querySelector(".summary")?.textContent).toContain(
    "44mV",
  );
});
it("retains separate headings for distinct area IDs with the same display name", async () => {
  const registry = structuredClone(snapshot);
  registry.areas.push({ area_id: "second-area", name: "Workshop area" });
  registry.devices.push({
    id: "second",
    name: "Second detector",
    area_id: "second-area",
  });
  registry.entities.push({
    entity_id: "binary_sensor.second_smoke",
    platform: "aegis_ajax",
    device_id: "second",
    unique_id: "second",
    labels: [],
  });
  const card = await mount({}, false, fixture(registry));
  expect(
    Array.from(card.shadowRoot!.querySelectorAll("ha-card h3")).map(
      (heading) => heading.textContent,
    ),
  ).toEqual(["Workshop area", "Workshop area"]);
});

it("removes healthy readings while disconnected and discovers changed membership on same-object ready", async () => {
  const hass = fixture();
  const card = await mount({ allow_bypass: true }, false, hass);
  hass.connection.lifecycle("disconnected");
  await settle();
  expect(card.shadowRoot!.querySelector(".summary")).toBeNull();
  expect(card.shadowRoot!.querySelector("[data-device]")).toBeNull();
  expect(card.shadowRoot!.querySelector("[data-bypass]")).toBeNull();
  expect(
    card.shadowRoot!.querySelector('[role="alert"]')?.textContent,
  ).toContain("disconnected");
  const registry = hass.connection.registry;
  registry.devices[0].name_by_user = "Fresh workshop";
  registry.entities.find(
    (entity) => entity.entity_id === "sensor.workshop_probe",
  )!.disabled_by = "user";
  registry.entities = registry.entities.filter(
    (entity) => entity.entity_id !== "binary_sensor.workshop_heat",
  );
  registry.devices.push({ id: "new-alarm", name: "New detector" });
  registry.entities.push({
    entity_id: "binary_sensor.new_smoke",
    platform: "aegis_ajax",
    device_id: "new-alarm",
    unique_id: "new",
  });
  hass.states["binary_sensor.new_smoke"] = {
    entity_id: "binary_sensor.new_smoke",
    state: "on",
    attributes: { device_class: "smoke" },
  };
  hass.connection.lifecycle("ready");
  await settle();
  expect(card.shadowRoot!.querySelector("[data-alarm]")?.textContent).toContain(
    "New detector",
  );
  hass.states["binary_sensor.new_smoke"].state = "off";
  card.hass = { ...hass };
  await settle();
  expect(card.shadowRoot!.textContent).toContain("Fresh workshop");
  expect(card.shadowRoot!.textContent).not.toContain("19.2");
  expect(card.shadowRoot!.querySelectorAll("[data-device]")).toHaveLength(2);
  click(card.shadowRoot!, '[data-device="ajax-workshop"]');
  await settle();
  expect(card.shadowRoot!.querySelector("#details")?.textContent).not.toContain(
    "binary_sensor.workshop_heat",
  );
  expect(
    card.shadowRoot!.querySelector(".disabled-notice")?.textContent,
  ).toContain("2");
});
it("uses normalized locale fallback for readings and updates language live", async () => {
  const hass = {
    ...fixture(),
    language: undefined,
    locale: { language: "NB_no" },
  };
  const card = await mount({}, false, hass);
  expect(card.shadowRoot!.textContent).toContain("tilkoblet");
  expect(card.shadowRoot!.textContent).toContain("19,2");
  click(card.shadowRoot!, "[data-device]");
  await settle();
  expect(card.shadowRoot!.querySelector("#details")?.textContent).toContain(
    "Av",
  );
  card.hass = { ...hass, language: "en" };
  await settle();
  expect(card.shadowRoot!.textContent).toContain("online");
  expect(card.shadowRoot!.textContent).toContain("19.2");
});

it("summarizes issues, widens rows that need attention and restores a bypassed row after confirmation", async () => {
  const calls: unknown[][] = [];
  const hass = fixture();
  hass.language = "nb";
  hass.callService = async (...args: unknown[]) => {
    calls.push(args);
  };
  hass.states["switch.workshop_bypass"].state = "on";
  hass.states["switch.workshop_bypass"].attributes.deactivation_kinds = [
    "permanent_tamper",
  ];
  const card = await mount({ allow_bypass: true }, false, hass);
  const root = card.shadowRoot!;
  expect(root.querySelector(".overview")?.textContent).toContain(
    "1 forbikoblet",
  );
  expect(root.querySelector(".row.wide.sev-attention")).not.toBeNull();
  expect(root.querySelector(".attention-chip")?.textContent).toBe(
    "Forbikoblet",
  );
  click(root, "[data-row-restore]");
  await settle();
  expect(root.querySelector("#confirmation[open]")?.textContent).toContain(
    "Gjenopprett",
  );
  expect(calls).toEqual([]);
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toEqual([
    ["switch", "turn_off", { entity_id: "switch.workshop_bypass" }],
  ]);
  card.setConfig({ allow_bypass: false });
  await settle();
  expect(root.querySelector("[data-row-restore]")).toBeNull();
});
it("keeps healthy devices as compact rows and reports a quiet system", async () => {
  const card = await mount();
  const root = card.shadowRoot!;
  expect(root.querySelector(".row.sev-ok:not(.wide)")).not.toBeNull();
  expect(root.querySelector(".overview")?.textContent).toContain(
    "No active alerts",
  );
});
it("device card shows its own status, temperature and tiles without the system summary", async () => {
  const hass = fixture();
  hass.language = "nb-NO";
  const card = await mount({ device: "ajax-workshop" }, true, hass);
  const root = card.shadowRoot!;
  expect(root.querySelector(".summary")).toBeNull();
  expect(root.querySelector("ha-card h2")).toBeNull();
  expect(root.querySelector(".status")?.textContent).toBe("I orden");
  expect(root.querySelector(".hero .big")?.textContent).toBe("19,2\u00a0°C");
  const tiles = Array.from(root.querySelectorAll(".tiles .tile")).map((tile) =>
    tile.textContent?.replace(/\s+/g, " ").trim(),
  );
  expect(tiles).toContain("Batteri 44%");
  expect(tiles).toContain("Sabotasje Intakt");
  card.setConfig({ device: "ajax-workshop", title: "Verksted" });
  await settle();
  expect(root.querySelector("ha-card h2")?.textContent).toBe("Verksted");
});
it("device card explains tamper-only bypass and how long an offline detector has been silent", async () => {
  const hass = fixture();
  hass.states["switch.workshop_bypass"].state = "on";
  hass.states["switch.workshop_bypass"].attributes.deactivation_kinds = [
    "permanent_tamper",
  ];
  const card = await mount({ device: "ajax-workshop" }, true, hass);
  const root = card.shadowRoot!;
  expect(root.querySelector(".status")?.textContent).toBe("Bypassed");
  expect(root.querySelector(".note")?.textContent).toContain(
    "Smoke and heat are still reported",
  );
  hass.states["switch.workshop_bypass"].attributes.deactivation_kinds = [
    "permanent_whole",
  ];
  card.hass = { ...hass };
  await settle();
  expect(root.querySelector(".note")?.textContent).toContain("will not report");
  hass.states["switch.workshop_bypass"].state = "off";
  hass.states["binary_sensor.workshop_connectivity"] = {
    ...hass.states["binary_sensor.workshop_connectivity"],
    state: "off",
    last_changed: new Date(Date.now() - (3 * 60 + 12) * 60000).toISOString(),
  };
  card.hass = { ...hass };
  await settle();
  expect(root.querySelector(".hero.sev-offline .big")?.textContent).toBe(
    "3 hr 12 min",
  );
  expect(root.querySelector(".note")?.textContent).toContain(
    "Cannot report fire",
  );
  expect(root.querySelector(".status")?.textContent).toBe("offline");
});
it("device card alarm takeover shows a running timer and keeps details", async () => {
  const hass = fixture();
  hass.states["binary_sensor.workshop_smoke"].state = "on";
  hass.states["binary_sensor.workshop_smoke"].last_changed = new Date(
    Date.now() - 134000,
  ).toISOString();
  const card = await mount({ device: "ajax-workshop" }, true, hass);
  const root = card.shadowRoot!;
  expect(root.querySelector(".tiles")).toBeNull();
  expect(root.querySelector("[data-alarm] .timer")?.textContent).toContain(
    "2:14",
  );
  expect(root.querySelector("[data-device]")).not.toBeNull();
});
it("opens a tapped device as its device card in a modal, with every reading one tap away", async () => {
  const hass = fixture();
  hass.language = "nb";
  const card = await mount({ appearance: "bubble" }, false, hass);
  const root = card.shadowRoot!;
  click(root, "[data-device]");
  await settle();
  const dialog = root.querySelector<HTMLDialogElement>("#details")!;
  expect(dialog.open).toBe(true);
  expect(dialog.classList.contains("bubble")).toBe(true);
  expect(dialog.querySelector("#detail-title")?.textContent).toBe("Workshop");
  expect(dialog.querySelector(".status")?.textContent).toBe("I orden");
  expect(dialog.querySelector(".hero .big")?.textContent).toBe("19,2 °C");
  expect(dialog.querySelectorAll(".tiles .tile").length).toBeGreaterThan(0);
  expect(dialog.querySelector("[data-device]")).toBeNull();
  expect(root.activeElement?.textContent?.trim()).toBe("Lukk");
  const readings = dialog.querySelector<HTMLDetailsElement>(".all-readings")!;
  expect(readings.open).toBe(false);
  expect(readings.querySelector("summary")?.textContent).toBe("Alle målinger");
  expect(readings.querySelectorAll(".entity").length).toBeGreaterThan(5);
});
