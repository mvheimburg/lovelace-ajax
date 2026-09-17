import { describe, expect, test } from "vitest";
import { deviceHealth, discoverDevices } from "../src/model";
import { healthyStates, snapshot } from "./fixtures";

describe("discoverDevices", () => {
  test("keeps only physical devices backed by Aegis registry entities", () => {
    expect(discoverDevices(snapshot, healthyStates).map((device) => device.name)).toEqual(["Workshop"]);
  });

  test("uses registry names and areas while excluding and counting disabled entities", () => {
    const device = discoverDevices(snapshot, healthyStates)[0];
    expect(device).toMatchObject({ id: "ajax-workshop", name: "Workshop", area: { id: "workshop", name: "Workshop area" }, disabledCount: 1 });
    expect(Object.values(device.entities).flat().map((entry) => entry.entityId)).not.toContain("sensor.workshop_disabled");
  });

  test("applies labels before classes and suffixes only when the domain supports the role", () => {
    const device = discoverDevices(snapshot, healthyStates)[0];
    expect(device.entities.tamper.map((entry) => entry.entityId)).toEqual(["binary_sensor.workshop_case"]);
    expect(device.entities.battery.map((entry) => entry.entityId)).toEqual([
      "sensor.workshop_cell_a",
      "sensor.workshop_battery_level",
      "binary_sensor.workshop_low_battery",
    ]);
    expect(device.entities.bypass.map((entry) => entry.entityId)).toEqual(["switch.workshop_bypass"]);
    expect(device.entities.temperature.map((entry) => entry.entityId)).toEqual(["sensor.workshop_probe"]);
  });

  test("retains multiple detectors and exposes unclassified enabled entities as Other", () => {
    const device = discoverDevices(snapshot, healthyStates)[0];
    expect(device.entities.alarm.map((entry) => entry.entityId)).toEqual([
      "binary_sensor.workshop_smoke",
      "binary_sensor.workshop_heat",
    ]);
    expect(device.unknownEntries.map((entry) => entry.entityId)).toEqual(["button.workshop_identify"]);
  });
});

describe("deviceHealth", () => {
  const device = () => discoverDevices(snapshot, healthyStates)[0];

  test("reports positive connectivity evidence and the lowest finite battery with its unit", () => {
    const health = deviceHealth(device(), healthyStates, 20);
    expect(health.online).toBe("online");
    expect(health.minBattery).toMatchObject({ entityId: "sensor.workshop_battery_level", value: 44, unit: "%" });
    expect(health.lowBattery).toEqual([]);
  });

  test("ignores empty and non-finite numeric battery states", () => {
    const states = {
      ...healthyStates,
      "sensor.workshop_cell_a": { ...healthyStates["sensor.workshop_cell_a"], state: "" },
      "sensor.workshop_battery_level": { ...healthyStates["sensor.workshop_battery_level"], state: "Infinity" },
    };
    const health = deviceHealth(device(), states, 20);
    expect(health.minBattery).toBeUndefined();
    expect(health.lowBattery).toEqual([]);
    expect(health.unknown.map((entry) => entry.entityId)).toEqual(expect.arrayContaining([
      "sensor.workshop_cell_a", "sensor.workshop_battery_level",
    ]));
  });

  test("honors a zero warning threshold and retains every low numeric or binary battery reading", () => {
    const states = {
      ...healthyStates,
      "sensor.workshop_cell_a": { ...healthyStates["sensor.workshop_cell_a"], state: "-1" },
      "sensor.workshop_battery_level": { ...healthyStates["sensor.workshop_battery_level"], state: "0" },
      "binary_sensor.workshop_low_battery": { ...healthyStates["binary_sensor.workshop_low_battery"], state: "on" },
    };
    const health = deviceHealth(device(), states, 0);
    expect(health.lowBattery.map((entry) => entry.entityId)).toEqual([
      "sensor.workshop_cell_a",
      "binary_sensor.workshop_low_battery",
    ]);
    expect(health.minBattery?.value).toBe(-1);
  });

  test("keeps alarm, tamper, problem, bypass and update findings separate", () => {
    const states = {
      ...healthyStates,
      "binary_sensor.workshop_smoke": { ...healthyStates["binary_sensor.workshop_smoke"], state: "on" },
      "binary_sensor.workshop_case": { ...healthyStates["binary_sensor.workshop_case"], state: "on" },
      "binary_sensor.workshop_fault": { ...healthyStates["binary_sensor.workshop_fault"], state: "on" },
      "switch.workshop_bypass": { ...healthyStates["switch.workshop_bypass"], state: "on", attributes: { deactivation_kinds: ["temporary_deactivation_tamper"] } },
      "update.workshop_firmware": { ...healthyStates["update.workshop_firmware"], state: "on" },
    };
    const health = deviceHealth(device(), states, 20);
    expect(health.alarm.map((entry) => entry.entityId)).toEqual(["binary_sensor.workshop_smoke"]);
    expect(health.tamper.map((entry) => entry.entityId)).toEqual(["binary_sensor.workshop_case"]);
    expect(health.problem.map((entry) => entry.entityId)).toEqual(["binary_sensor.workshop_fault"]);
    expect(health.bypassed[0]).toMatchObject({ entityId: "switch.workshop_bypass", deactivationKinds: ["temporary_deactivation_tamper"], wholeDevice: false });
    expect(health.update.map((entry) => entry.entityId)).toEqual(["update.workshop_firmware"]);
  });

  test("treats unavailable readings as offline and missing or unknown states as unknown, never clear", () => {
    const states = { ...healthyStates } as Record<string, (typeof healthyStates)[keyof typeof healthyStates]>;
    states["sensor.workshop_probe"] = { ...healthyStates["sensor.workshop_probe"], state: "unavailable" };
    delete states["binary_sensor.workshop_heat"];
    states["binary_sensor.workshop_case"] = { ...healthyStates["binary_sensor.workshop_case"], state: "unknown" };
    const health = deviceHealth(device(), states, 20);
    expect(health.online).toBe("offline");
    expect(health.offline.map((entry) => entry.entityId)).toContain("sensor.workshop_probe");
    expect(health.unknown.map((entry) => entry.entityId)).toEqual(expect.arrayContaining(["binary_sensor.workshop_heat", "binary_sensor.workshop_case"]));
  });

  test.each([
    ["on", "online"],
    ["off", "offline"],
    ["unknown", "unknown"],
  ] as const)("maps connectivity %s to %s when other readings are available", (state, expected) => {
    const states = {
      ...healthyStates,
      "binary_sensor.workshop_connectivity": { ...healthyStates["binary_sensor.workshop_connectivity"], state },
    };
    expect(deviceHealth(device(), states, 20).online).toBe(expected);
  });
});
