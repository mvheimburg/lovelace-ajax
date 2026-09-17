import { healthyStates, snapshot } from "./fixtures";
import type { HomeAssistant, RegistrySnapshot } from "../src/types";
export function fixture(
  registry: RegistrySnapshot = structuredClone(snapshot),
): HomeAssistant {
  return {
    states: structuredClone(healthyStates),
    language: "en",
    connection: {
      async sendMessagePromise<T>({ type }: { type: string }): Promise<T> {
        const key = type.split("/")[1].replace("_registry", "");
        return registry[
          `${key === "entity" ? "entitie" : key === "area" ? "area" : key === "device" ? "device" : "label"}s` as keyof RegistrySnapshot
        ] as T;
      },
      async subscribeEvents() {
        return () => {};
      },
    },
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
