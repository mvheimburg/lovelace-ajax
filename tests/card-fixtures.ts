import { healthyStates, snapshot } from "./fixtures";
import type { HomeAssistant, RegistrySnapshot } from "../src/types";
export class FixtureConnection {
  connected = true;
  lifecycleListeners = new Map<string, Set<() => void>>();
  subscriptions = new Map<string, Set<(event: unknown) => void>>();
  constructor(public registry: RegistrySnapshot) {}
  addEventListener(type: string, callback: () => void) {
    const listeners = this.lifecycleListeners.get(type) ?? new Set();
    listeners.add(callback);
    this.lifecycleListeners.set(type, listeners);
  }
  removeEventListener(type: string, callback: () => void) {
    this.lifecycleListeners.get(type)?.delete(callback);
  }
  // HA keeps the Connection object and restores its subscriptions internally.
  lifecycle(type: "disconnected" | "ready") {
    this.connected = type === "ready";
    this.lifecycleListeners.get(type)?.forEach((callback) => callback());
  }
  async sendMessagePromise<T>({ type }: { type: string }): Promise<T> {
    const values: Record<string, unknown> = {
      "config/entity_registry/list": this.registry.entities,
      "config/device_registry/list": this.registry.devices,
      "config/area_registry/list": this.registry.areas,
      "config/label_registry/list": this.registry.labels,
    };
    // Real websocket responses are immutable snapshots of server data.
    return structuredClone(values[type]) as T;
  }
  async subscribeEvents<T>(callback: (event: T) => void, type: string) {
    const listeners = this.subscriptions.get(type) ?? new Set();
    const listener = callback as (event: unknown) => void;
    listeners.add(listener);
    this.subscriptions.set(type, listeners);
    return () => {
      listeners.delete(listener);
    };
  }
}
export function fixture(
  registry: RegistrySnapshot = structuredClone(snapshot),
): Omit<HomeAssistant, "connection"> & { connection: FixtureConnection } {
  return {
    states: structuredClone(healthyStates),
    language: "en",
    connection: new FixtureConnection(registry),
  };
}
export async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 30));
}
export function click(root: ShadowRoot, selector: string) {
  const el = root.querySelector<HTMLButtonElement>(selector);
  if (!el) throw new Error(`Missing ${selector}`);
  el.click();
}
