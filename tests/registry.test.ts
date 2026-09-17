import { describe, expect, test, vi } from "vitest";
import { watchRegistries } from "../src/registry";
import { snapshot } from "./fixtures";
import type { HassConnection, HomeAssistant, RegistryWatchValue } from "../src/types";

const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

class FakeConnection implements HassConnection {
  calls: string[] = [];
  listeners = new Map<string, (event: unknown) => void>();
  unsubscribes: Array<ReturnType<typeof vi.fn>> = [];
  subscribeGates: Array<ReturnType<typeof deferred<() => void>>> = [];
  responder: (type: string) => Promise<unknown>;

  constructor(responder?: (type: string) => Promise<unknown>) {
    this.responder = responder ?? (async (type) => ({
      "config/entity_registry/list": snapshot.entities,
      "config/device_registry/list": snapshot.devices,
      "config/area_registry/list": snapshot.areas,
      "config/label_registry/list": snapshot.labels,
    })[type]);
  }

  sendMessagePromise<T>(message: { type: string }): Promise<T> {
    this.calls.push(message.type);
    return this.responder(message.type) as Promise<T>;
  }

  subscribeEvents<T>(callback: (event: T) => void, eventType: string): Promise<() => void> {
    this.listeners.set(eventType, callback as (event: unknown) => void);
    const unsubscribe = vi.fn();
    this.unsubscribes.push(unsubscribe);
    const gate = this.subscribeGates.shift();
    return gate ? gate.promise : Promise.resolve(unsubscribe);
  }

  emit(eventType: string) {
    this.listeners.get(eventType)?.({ event_type: eventType });
  }
}

const hassFor = (connection: HassConnection): HomeAssistant => ({ connection, states: {} });

describe("watchRegistries", () => {
  test("fetches all registries initially and publishes one coherent snapshot", async () => {
    const connection = new FakeConnection();
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) => observed.push(value));
    await settle();
    expect(connection.calls).toEqual([
      "config/entity_registry/list", "config/device_registry/list", "config/area_registry/list", "config/label_registry/list",
    ]);
    expect(observed[observed.length - 1]?.snapshot?.devices[0].name).toBe("Ajax detector");
    stop();
  });

  test("shares fetches and registry subscriptions per connection", async () => {
    const connection = new FakeConnection();
    const first: RegistryWatchValue[] = [];
    const second: RegistryWatchValue[] = [];
    const stopFirst = watchRegistries(hassFor(connection), (value) => first.push(value));
    const stopSecond = watchRegistries(hassFor(connection), (value) => second.push(value));
    await settle();
    expect(connection.calls).toHaveLength(4);
    expect(connection.listeners.size).toBe(4);
    expect(first[first.length - 1]?.snapshot).toBe(second[second.length - 1]?.snapshot);
    stopFirst();
    stopSecond();
  });

  test("refreshes after each registry update event", async () => {
    const connection = new FakeConnection();
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) => observed.push(value));
    await settle();
    connection.emit("entity_registry_updated");
    await settle();
    expect(connection.calls).toHaveLength(8);
    expect(observed).toHaveLength(2);
    stop();
  });

  test("makes required registry failures visible and retries on the next update", async () => {
    let failing = true;
    const connection = new FakeConnection(async (type) => {
      if (type === "config/device_registry/list" && failing) throw new Error("device registry denied");
      return ({
        "config/entity_registry/list": snapshot.entities,
        "config/device_registry/list": snapshot.devices,
        "config/area_registry/list": snapshot.areas,
        "config/label_registry/list": snapshot.labels,
      })[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) => observed.push(value));
    await settle();
    expect(observed[observed.length - 1]).toEqual({ error: "device registry denied" });
    failing = false;
    connection.emit("device_registry_updated");
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.devices).toEqual(snapshot.devices);
    expect(observed[observed.length - 1]?.error).toBeUndefined();
    stop();
  });

  test("treats the unavailable label API as optional", async () => {
    const connection = new FakeConnection(async (type) => {
      if (type === "config/label_registry/list") throw new Error("unknown command");
      return ({
        "config/entity_registry/list": snapshot.entities,
        "config/device_registry/list": snapshot.devices,
        "config/area_registry/list": snapshot.areas,
      })[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) => observed.push(value));
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.labels).toEqual([]);
    expect(observed[observed.length - 1]?.error).toBeUndefined();
    stop();
  });

  test("suppresses a stale refresh that resolves after a newer one", async () => {
    const deviceRequests: Array<ReturnType<typeof deferred<typeof snapshot.devices>>> = [];
    let initial = true;
    const connection = new FakeConnection(async (type) => {
      if (type === "config/device_registry/list") {
        if (initial) return snapshot.devices;
        const request = deferred<typeof snapshot.devices>();
        deviceRequests.push(request);
        return request.promise;
      }
      return ({
        "config/entity_registry/list": snapshot.entities,
        "config/area_registry/list": snapshot.areas,
        "config/label_registry/list": snapshot.labels,
      })[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) => observed.push(value));
    await settle();
    initial = false;
    connection.emit("entity_registry_updated");
    connection.emit("device_registry_updated");
    await Promise.resolve();
    deviceRequests[1].resolve([{ ...snapshot.devices[0], name: "Newest" }, snapshot.devices[1]]);
    await settle();
    deviceRequests[0].resolve([{ ...snapshot.devices[0], name: "Stale" }, snapshot.devices[1]]);
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.devices[0].name).toBe("Newest");
    stop();
  });

  test("unsubscribes a pending subscription once it resolves after detach", async () => {
    const connection = new FakeConnection();
    const gate = deferred<() => void>();
    connection.subscribeGates.push(gate);
    const stop = watchRegistries(hassFor(connection), () => undefined);
    stop();
    const unsubscribe = vi.fn();
    gate.resolve(unsubscribe);
    await settle();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  test("keeps subscriptions until the last watcher detaches and then cleans them all", async () => {
    const connection = new FakeConnection();
    const stopFirst = watchRegistries(hassFor(connection), () => undefined);
    const stopSecond = watchRegistries(hassFor(connection), () => undefined);
    await settle();
    stopFirst();
    expect(connection.unsubscribes.every((unsubscribe) => unsubscribe.mock.calls.length === 0)).toBe(true);
    stopSecond();
    expect(connection.unsubscribes).toHaveLength(4);
    expect(connection.unsubscribes.every((unsubscribe) => unsubscribe.mock.calls.length === 1)).toBe(true);
  });
});
