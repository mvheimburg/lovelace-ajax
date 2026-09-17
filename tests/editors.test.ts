import { afterEach, describe, expect, it } from "vitest";
import { fixture, settle } from "./card-fixtures";
import { snapshot } from "./fixtures";
import "../src/aegis-panel-card";

type Editor = HTMLElement & {
  setConfig(config: Record<string, unknown>): void;
  hass: ReturnType<typeof fixture>;
};

afterEach(() => document.body.replaceChildren());

async function mount(
  tag: "aegis-panel-card-editor" | "aegis-device-card-editor",
  config: Record<string, unknown>,
  hass = fixture(),
) {
  const editor = document.createElement(tag) as Editor;
  editor.setConfig(config);
  editor.hass = hass;
  document.body.append(editor);
  await settle();
  return editor;
}

function change(
  editor: Editor,
  selector: string,
  value: string | boolean,
): Promise<Record<string, unknown>> {
  const control = editor.shadowRoot!.querySelector<
    HTMLInputElement | HTMLSelectElement
  >(selector);
  if (!control) throw new Error(`Missing ${selector}`);
  const event = new Promise<Record<string, unknown>>((resolve) => {
    editor.addEventListener(
      "config-changed",
      (received) => resolve((received as CustomEvent).detail.config),
      { once: true },
    );
  });
  if (typeof value === "boolean") (control as HTMLInputElement).checked = value;
  else control.value = value;
  control.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  return event;
}

describe("Aegis visual editors", () => {
  it("round-trips zero, false, and unknown YAML keys through panel edits", async () => {
    const editor = await mount("aegis-panel-card-editor", {
      type: "custom:aegis-panel-card",
      battery_warning: 0,
      show_temperature: false,
      allow_bypass: false,
      custom: "keep",
    });

    const titled = await change(editor, '[name="title"]', "Fire safety");
    expect(titled).toMatchObject({
      type: "custom:aegis-panel-card",
      battery_warning: 0,
      show_temperature: false,
      allow_bypass: false,
      custom: "keep",
      title: "Fire safety",
    });
    expect(await change(editor, '[name="group_by"]', "none")).toMatchObject({
      group_by: "none",
      custom: "keep",
    });
    expect(await change(editor, '[name="appearance"]', "bubble")).toMatchObject(
      {
        appearance: "bubble",
        custom: "keep",
      },
    );
  });

  it("offers only Aegis devices and retains a selected value after registry loading", async () => {
    const editor = await mount("aegis-device-card-editor", {
      type: "custom:aegis-device-card",
      device: "ajax-workshop",
      custom: 0,
    });
    const select =
      editor.shadowRoot!.querySelector<HTMLSelectElement>('[name="device"]')!;
    expect(
      Array.from(select.options).map((option) => [option.value, option.text]),
    ).toEqual([
      ["", "Select an Aegis device"],
      ["ajax-workshop", "Workshop"],
    ]);
    expect(select.value).toBe("ajax-workshop");
    expect(
      await change(editor, '[name="device"]', "ajax-workshop"),
    ).toMatchObject({
      device: "ajax-workshop",
      custom: 0,
    });
  });

  it("finishes pending discovery across routine hass object updates", async () => {
    const hass = fixture();
    const pending = new Map<string, (value: unknown) => void>();
    hass.connection.sendMessagePromise = <T>({ type }: { type: string }) =>
      new Promise<T>((resolve) =>
        pending.set(type, (value) => resolve(value as T)),
      );
    const editor = document.createElement("aegis-device-card-editor") as Editor;
    editor.setConfig({
      type: "custom:aegis-device-card",
      device: "Workshop",
    });
    editor.hass = hass;
    document.body.append(editor);
    await Promise.resolve();
    editor.hass = { ...hass, states: { ...hass.states } };
    const registry = structuredClone(snapshot);
    pending.get("config/entity_registry/list")!(registry.entities);
    pending.get("config/device_registry/list")!(registry.devices);
    pending.get("config/area_registry/list")?.(registry.areas);
    pending.get("config/label_registry/list")?.(registry.labels);
    await settle();

    const select =
      editor.shadowRoot!.querySelector<HTMLSelectElement>('[name="device"]')!;
    expect(select.value).toBe("Workshop");
    expect(Array.from(select.options).map((option) => option.value)).toContain(
      "ajax-workshop",
    );
    expect(
      await change(editor, '[name="title"]', "Workshop safety"),
    ).toMatchObject({
      device: "Workshop",
      title: "Workshop safety",
    });
    expect(
      await change(editor, '[name="device"]', "ajax-workshop"),
    ).toMatchObject({ device: "ajax-workshop" });
  });

  it("keeps an ambiguous configured name distinct from stable ID choices", async () => {
    const registry = structuredClone(snapshot);
    registry.devices.push({
      ...registry.devices[0],
      id: "ajax-workshop-copy",
    });
    registry.entities.push({
      ...registry.entities[0],
      entity_id: "binary_sensor.workshop_copy_smoke",
      device_id: "ajax-workshop-copy",
    });
    const editor = await mount(
      "aegis-device-card-editor",
      { type: "custom:aegis-device-card", device: "Workshop" },
      fixture(registry),
    );
    const select =
      editor.shadowRoot!.querySelector<HTMLSelectElement>('[name="device"]')!;
    expect(select.value).toBe("Workshop");
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      "",
      "Workshop",
      "ajax-workshop",
      "ajax-workshop-copy",
    ]);
    expect(Array.from(select.options).map((option) => option.text)).toEqual([
      "Select an Aegis device",
      "Workshop — Select an Aegis device",
      "Workshop (ajax-workshop)",
      "Workshop (ajax-workshop-copy)",
    ]);
    expect(await change(editor, '[name="title"]', "Safety")).toMatchObject({
      device: "Workshop",
    });
    expect(
      await change(editor, '[name="device"]', "ajax-workshop-copy"),
    ).toMatchObject({ device: "ajax-workshop-copy" });
  });

  it("accepts a blank device stub, falls back to text, localizes labels, and rejects invalid thresholds", async () => {
    const hass = fixture();
    hass.language = "nb-NO";
    hass.connection.sendMessagePromise = async () => {
      throw new Error("registry unavailable");
    };
    const editor = await mount(
      "aegis-device-card-editor",
      { type: "custom:aegis-device-card", device: "", battery_warning: 20 },
      hass,
    );
    const root = editor.shadowRoot!;
    expect(root.textContent).toContain("Enhet");
    expect(root.querySelector<HTMLInputElement>('[name="device"]')?.type).toBe(
      "text",
    );
    expect(
      await change(editor, '[name="device"]', "manual-device-id"),
    ).toMatchObject({
      device: "manual-device-id",
    });

    let blankDeviceEmitted = false;
    editor.addEventListener(
      "config-changed",
      () => (blankDeviceEmitted = true),
      {
        once: true,
      },
    );
    const device = root.querySelector<HTMLInputElement>('[name="device"]')!;
    device.value = "";
    device.dispatchEvent(
      new Event("change", { bubbles: true, composed: true }),
    );
    await settle();
    expect(blankDeviceEmitted).toBe(false);
    expect(device.getAttribute("aria-invalid")).toBe("true");

    let emitted = false;
    editor.addEventListener("config-changed", () => (emitted = true), {
      once: true,
    });
    const battery = root.querySelector<HTMLInputElement>(
      '[name="battery_warning"]',
    )!;
    battery.value = "101";
    battery.dispatchEvent(
      new Event("change", { bubbles: true, composed: true }),
    );
    await settle();
    expect(emitted).toBe(false);
    expect(battery.getAttribute("aria-invalid")).toBe("true");
    expect(root.textContent).toContain("0–100");
  });

  it("clears the optional alarm entity instead of serializing an empty string", async () => {
    const hass = fixture();
    hass.states["alarm_control_panel.home"] = {
      entity_id: "alarm_control_panel.home",
      state: "disarmed",
      attributes: { friendly_name: "Home alarm" },
    };
    const editor = await mount(
      "aegis-panel-card-editor",
      {
        type: "custom:aegis-panel-card",
        alarm_entity: "alarm_control_panel.home",
        custom: false,
      },
      hass,
    );
    const alarm = editor.shadowRoot!.querySelector<HTMLSelectElement>(
      '[name="alarm_entity"]',
    )!;
    expect(alarm.value).toBe("alarm_control_panel.home");
    expect(await change(editor, '[name="alarm_entity"]', "")).toEqual(
      expect.not.objectContaining({ alarm_entity: expect.anything() }),
    );
  });
});

it("recovers device choices from same-Connection ready after an offline rename and removal", async () => {
  const hass = fixture();
  const editor = await mount(
    "aegis-device-card-editor",
    {
      type: "custom:aegis-device-card",
      device: "ajax-workshop",
    },
    hass,
  );
  hass.connection.lifecycle("disconnected");
  await settle();
  expect(editor.shadowRoot!.querySelector('select[name="device"]')).toBeNull();
  expect(
    editor.shadowRoot!.querySelector<HTMLInputElement>('input[name="device"]')
      ?.value,
  ).toBe("ajax-workshop");
  hass.connection.registry.devices[0].name_by_user = "Fresh workshop";
  hass.connection.lifecycle("ready");
  await settle();
  const select = editor.shadowRoot!.querySelector<HTMLSelectElement>(
    'select[name="device"]',
  )!;
  expect(select.value).toBe("ajax-workshop");
  expect(Array.from(select.options).map((option) => option.text)).toContain(
    "Fresh workshop",
  );
  hass.connection.lifecycle("disconnected");
  hass.connection.registry.entities = [];
  hass.connection.lifecycle("ready");
  await settle();
  expect(
    Array.from(
      editor.shadowRoot!.querySelector<HTMLSelectElement>(
        'select[name="device"]',
      )!.options,
    ).map((option) => option.value),
  ).toEqual([""]);
});
