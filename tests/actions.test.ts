import { afterEach, expect, it } from "vitest";
import { AegisPanelCard } from "../src/aegis-panel-card";
import { fixture, settle, click } from "./card-fixtures";
import type { HomeAssistant } from "../src/types";
afterEach(() => document.body.replaceChildren());
async function mount(
  allow = true,
  service: (...args: unknown[]) => Promise<unknown> = async () => {},
) {
  const card = new AegisPanelCard();
  const hass = fixture() as HomeAssistant & { callService: typeof service };
  hass.callService = service;
  card.setConfig({ allow_bypass: allow });
  card.hass = hass;
  document.body.append(card);
  await settle();
  return { card, hass, root: card.shadowRoot! };
}
it("hides bypass controls by default", async () => {
  const { root } = await mount(false);
  expect(root.querySelector("[data-bypass]")).toBeNull();
});
it("cancel makes no call and confirm sends only the current Aegis bypass target", async () => {
  const calls: unknown[][] = [];
  const { root } = await mount(true, async (...args) => {
    calls.push(args);
  });
  click(root, "[data-bypass]");
  await settle();
  expect(calls).toEqual([]);
  expect(root.querySelector("#confirmation")?.textContent).toContain(
    "Workshop",
  );
  click(root, "[data-cancel]");
  await settle();
  expect(calls).toEqual([]);
  click(root, "[data-bypass]");
  await settle();
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toEqual([
    ["switch", "turn_on", { entity_id: "switch.workshop_bypass" }],
  ]);
  expect(root.textContent).toContain("Waiting for Home Assistant");
  click(root, "[data-device]");
  await settle();
  expect(root.querySelector("#details")?.textContent).toContain("off");
});
it("revalidates permission on config changes and availability on state changes", async () => {
  const calls: unknown[][] = [];
  const { card, hass, root } = await mount(true, async (...args) => {
    calls.push(args);
  });
  click(root, "[data-bypass]");
  await settle();
  card.setConfig({ allow_bypass: false });
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toEqual([]);
  card.setConfig({ allow_bypass: true });
  await settle();
  click(root, "[data-bypass]");
  await settle();
  hass.states["switch.workshop_bypass"].state = "unavailable";
  card.hass = { ...hass };
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toEqual([]);
  expect(root.textContent).toContain("scope changed");
});
it("suppresses repeated confirm clicks while pending and exposes service rejection", async () => {
  let reject!: (error: Error) => void;
  let calls = 0;
  const { root } = await mount(true, () => {
    calls++;
    return new Promise((_, r) => {
      reject = r;
    });
  });
  click(root, "[data-bypass]");
  await settle();
  click(root, "[data-confirm]");
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toBe(1);
  expect(
    root.querySelector<HTMLButtonElement>("[data-confirm]")?.disabled,
  ).toBe(true);
  reject(new Error("Permission denied"));
  await settle();
  expect(root.textContent).toContain("Permission denied");
  expect(root.textContent).toContain("failed");
});
it("reports partial bulk failure and restore targets, without changing displayed HA state", async () => {
  const calls: unknown[][] = [];
  const { card, hass, root } = await mount(true, async (...args) => {
    calls.push(args);
    if (calls.length === 2) throw new Error("Second switch failed");
  });
  const registry = (await import("./fixtures")).snapshot;
  const extra = structuredClone(registry);
  extra.entities.push({
    entity_id: "switch.workshop_extra_bypass",
    platform: "aegis_ajax",
    device_id: "ajax-workshop",
    unique_id: "extra",
    labels: [],
  });
  const replacement = fixture(extra);
  replacement.callService = hass.callService;
  replacement.states["switch.workshop_extra_bypass"] = {
    entity_id: "switch.workshop_extra_bypass",
    state: "on",
    attributes: { deactivation_kinds: ["permanent_tamper"] },
  };
  card.hass = replacement;
  await settle();
  click(root, "[data-restore]");
  await settle();
  expect(root.querySelector("#confirmation")!.textContent).toContain(
    "Available switches: 2",
  );
  expect(root.querySelector("#confirmation")!.textContent).toContain(
    "permanent_tamper",
  );
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toEqual([
    ["switch", "turn_off", { entity_id: "switch.workshop_bypass" }],
    ["switch", "turn_off", { entity_id: "switch.workshop_extra_bypass" }],
  ]);
  expect(root.textContent).toContain("Second switch failed");
  expect(replacement.states["switch.workshop_extra_bypass"].state).toBe("on");
});
it("stops remaining bulk calls if permission changes while a first call is pending", async () => {
  let release!: () => void;
  const calls: unknown[][] = [];
  const { card, hass, root } = await mount(true, async (...args) => {
    calls.push(args);
    await new Promise<void>((resolve) => {
      release = resolve;
    });
  });
  const registry = structuredClone((await import("./fixtures")).snapshot);
  registry.entities.push({
    entity_id: "switch.extra_bypass",
    platform: "aegis_ajax",
    device_id: "ajax-workshop",
    unique_id: "extra",
    labels: [],
  });
  const replacement = fixture(registry);
  replacement.callService = hass.callService;
  replacement.states["switch.extra_bypass"] = {
    entity_id: "switch.extra_bypass",
    state: "off",
    attributes: {},
  };
  card.hass = replacement;
  await settle();
  click(root, "[data-bypass]");
  await settle();
  click(root, "[data-confirm]");
  await settle();
  card.setConfig({ allow_bypass: false });
  release();
  await settle();
  expect(calls).toEqual([
    ["switch", "turn_on", { entity_id: "switch.workshop_bypass" }],
  ]);
  expect(root.textContent).toContain("scope changed");
});
it("per-device confirmation excludes other Aegis devices and unavailable bypass switches", async () => {
  const registry = structuredClone((await import("./fixtures")).snapshot);
  registry.devices.push({
    id: "second",
    name: "Second device",
    area_id: "hall",
  });
  registry.entities.push(
    {
      entity_id: "switch.second_bypass",
      platform: "aegis_ajax",
      device_id: "second",
      unique_id: "second",
      labels: [],
    },
    {
      entity_id: "switch.unavailable_bypass",
      platform: "aegis_ajax",
      device_id: "ajax-workshop",
      unique_id: "unavailable",
      labels: [],
    },
  );
  const hass = fixture(registry);
  hass.states["switch.second_bypass"] = {
    entity_id: "switch.second_bypass",
    state: "off",
    attributes: {},
  };
  hass.states["switch.unavailable_bypass"] = {
    entity_id: "switch.unavailable_bypass",
    state: "unavailable",
    attributes: {},
  };
  const calls: unknown[][] = [];
  hass.callService = async (...args) => {
    calls.push(args);
  };
  const card = new AegisPanelCard();
  card.setConfig({ allow_bypass: true });
  card.hass = hass;
  document.body.append(card);
  await settle();
  const root = card.shadowRoot!;
  click(root, '[data-device="ajax-workshop"]');
  await settle();
  click(root, "#details [data-bypass]");
  await settle();
  expect(root.querySelector("#confirmation")!.textContent).toContain(
    "Available switches: 1",
  );
  expect(root.querySelector("#confirmation")!.textContent).not.toContain(
    "Second device",
  );
  click(root, "[data-confirm]");
  await settle();
  expect(calls).toEqual([
    ["switch", "turn_on", { entity_id: "switch.workshop_bypass" }],
  ]);
});
it("keeps per-device service feedback visible in the still-open details dialog", async () => {
  const { root } = await mount(true, async () => {
    throw new Error("Access rejected");
  });
  click(root, "[data-device]");
  await settle();
  click(root, "#details [data-bypass]");
  await settle();
  click(root, "[data-confirm]");
  await settle();
  expect(
    root.querySelector('#details[open] [role="status"]')?.textContent,
  ).toContain("Access rejected");
});
