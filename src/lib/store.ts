/**
 * A minimal external store.
 *
 * The interactive layer (command palette, corner player, achievements) needs a
 * few pieces of state to be readable from several components at once. Options
 * considered:
 *
 *   - React Context: re-renders the whole subtree on every change, and forces a
 *     provider into the layout.
 *   - A store + `useSyncExternalStore`: any component can subscribe to exactly
 *     the slice it needs, nothing re-renders that doesn't read it, and there is
 *     no provider nesting.
 *
 * We use the latter. `createStore` is deliberately pure — no DOM, no React — so
 * it can be unit-tested in the plain node environment the rest of `src/lib` uses.
 */

export type Listener = () => void;

export interface Store<T> {
  /** Current snapshot. Stable by reference until the next `set`. */
  get(): T;
  /** Replace the state, or update it from the previous value. No-op if equal. */
  set(next: T | ((previous: T) => T)): void;
  /** Subscribe to changes. Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();

  return {
    get: () => state,
    set: (next) => {
      const value =
        typeof next === "function" ? (next as (previous: T) => T)(state) : next;
      // Object.is keeps us from notifying on identical primitives or on an
      // update that returned the very same object.
      if (Object.is(value, state)) return;
      state = value;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
