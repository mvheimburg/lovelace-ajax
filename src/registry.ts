import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  HassConnection,
  HomeAssistant,
  LabelRegistryEntry,
  RegistrySnapshot,
  RegistryWatchValue,
} from "./types";

type WatchCallback = (value: RegistryWatchValue) => void;

const UPDATE_EVENTS = [
  "entity_registry_updated",
  "device_registry_updated",
  "area_registry_updated",
  "label_registry_updated",
] as const;

const sharedByConnection = new WeakMap<HassConnection, SharedRegistryWatcher>();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class SharedRegistryWatcher {
  private readonly callbacks = new Set<WatchCallback>();
  private readonly unsubscribes = new Set<() => void>();
  private generation = 0;
  private stopped = false;
  private value?: RegistryWatchValue;

  constructor(private readonly connection: HassConnection) {
    void this.refresh();
    for (const eventType of UPDATE_EVENTS) {
      void connection.subscribeEvents(() => { void this.refresh(); }, eventType)
        .then((unsubscribe) => {
          if (this.stopped) unsubscribe();
          else this.unsubscribes.add(unsubscribe);
        })
        .catch((error: unknown) => this.publish({ error: errorMessage(error) }));
    }
  }

  add(callback: WatchCallback): () => void {
    this.callbacks.add(callback);
    if (this.value) callback(this.value);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) this.destroy();
    };
  }

  private async refresh(): Promise<void> {
    const generation = ++this.generation;
    const send = <T>(type: string) => this.connection.sendMessagePromise<T>({ type });
    const entities = send<EntityRegistryEntry[]>("config/entity_registry/list");
    const devices = send<DeviceRegistryEntry[]>("config/device_registry/list");
    const areas = send<AreaRegistryEntry[]>("config/area_registry/list");
    const labels = send<LabelRegistryEntry[]>("config/label_registry/list").catch(() => []);
    try {
      const [resolvedEntities, resolvedDevices, resolvedAreas, resolvedLabels] = await Promise.all([
        entities, devices, areas, labels,
      ]);
      if (generation !== this.generation || this.stopped) return;
      const snapshot: RegistrySnapshot = {
        entities: resolvedEntities,
        devices: resolvedDevices,
        areas: resolvedAreas,
        labels: resolvedLabels,
      };
      this.publish({ snapshot });
    } catch (error) {
      if (generation !== this.generation || this.stopped) return;
      this.publish({ error: errorMessage(error) });
    }
  }

  private publish(value: RegistryWatchValue): void {
    if (this.stopped) return;
    this.value = value;
    for (const callback of this.callbacks) callback(value);
  }

  private destroy(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.generation += 1;
    for (const unsubscribe of this.unsubscribes) unsubscribe();
    this.unsubscribes.clear();
    sharedByConnection.delete(this.connection);
  }
}

export function watchRegistries(hass: HomeAssistant, callback: WatchCallback): () => void {
  let watcher = sharedByConnection.get(hass.connection);
  if (!watcher) {
    watcher = new SharedRegistryWatcher(hass.connection);
    sharedByConnection.set(hass.connection, watcher);
  }
  return watcher.add(callback);
}
