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
  expect(card.shadowRoot!.textContent).toContain("0 ukjent");
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
