/**
 * Regions an optimistic gesture cannot predict (grid, counts, totals) and the producer has not
 * rebuilt yet. Region names belong to the consumer and are never interpreted here.
 */

export type StaleScope = string;

export interface StaleScopes {
  /** An id already tracked is ignored. */
  track: (id: string, scopes: readonly StaleScope[]) => void;
  /** A region stays stale while any other dispatch still holds it. */
  settle: (id: string) => void;
  isStale: (scope: StaleScope) => boolean;
  subscribe: (listener: () => void) => () => void;
  /** Moves only when the set of stale regions changes. */
  getVersion: () => number;
}

export function createStaleScopes(): StaleScopes {
  const held = new Map<string, readonly StaleScope[]>();
  const holders = new Map<StaleScope, number>();
  const listeners = new Set<() => void>();
  let version = 0;

  // Over a copy: a listener may unsubscribe while being notified.
  function changed(): void {
    version += 1;
    for (const listener of [...listeners]) {
      listener();
    }
  }

  /** True when some scope gained its first holder or lost its last. */
  function adjustHolders(scopes: readonly StaleScope[], delta: 1 | -1): boolean {
    let crossed = false;
    for (const scope of scopes) {
      const before = holders.get(scope) ?? 0;
      const after = before + delta;
      if (after > 0) {
        holders.set(scope, after);
      } else {
        holders.delete(scope);
      }
      crossed ||= before === 0 || after === 0;
    }
    return crossed;
  }

  function track(id: string, scopes: readonly StaleScope[]): void {
    if (held.has(id)) {
      return;
    }
    held.set(id, [...scopes]);
    if (adjustHolders(scopes, 1)) {
      changed();
    }
  }

  function settle(id: string): void {
    const scopes = held.get(id);
    if (scopes === undefined) {
      return;
    }
    held.delete(id);
    if (adjustHolders(scopes, -1)) {
      changed();
    }
  }

  function isStale(scope: StaleScope): boolean {
    return (holders.get(scope) ?? 0) > 0;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getVersion(): number {
    return version;
  }

  return {track, settle, isStale, subscribe, getVersion};
}
