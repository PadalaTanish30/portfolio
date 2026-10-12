import { describe, expect, it, vi } from "vitest";
import { createStore } from "@/lib/store";

describe("createStore", () => {
  it("returns the initial value", () => {
    const store = createStore(1);
    expect(store.get()).toBe(1);
  });

  it("replaces state with a plain value", () => {
    const store = createStore("a");
    store.set("b");
    expect(store.get()).toBe("b");
  });

  it("updates from the previous value with an updater", () => {
    const store = createStore({ count: 1 });
    store.set((previous) => ({ count: previous.count + 1 }));
    expect(store.get()).toEqual({ count: 2 });
  });

  it("notifies every subscriber on change", () => {
    const store = createStore(0);
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);

    store.set(1);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("does not notify when the next value is identical", () => {
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(1);

    expect(listener).not.toHaveBeenCalled();
  });

  it("does not notify when an updater returns the same reference", () => {
    const initial = { items: [] as number[] };
    const store = createStore(initial);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set((previous) => previous);

    expect(listener).not.toHaveBeenCalled();
    expect(store.get()).toBe(initial);
  });

  it("stops notifying after unsubscribe", () => {
    const store = createStore(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(1);

    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the snapshot reference stable between writes", () => {
    const store = createStore({ value: 1 });
    const before = store.get();
    const listener = vi.fn();
    store.subscribe(listener);

    // A no-op write must not swap the snapshot, or useSyncExternalStore would
    // loop forever re-rendering.
    store.set((previous) => previous);

    expect(store.get()).toBe(before);
  });
});
