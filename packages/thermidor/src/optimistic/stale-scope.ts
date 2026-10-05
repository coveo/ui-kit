/**
 * Which regions of what is on screen the producer has not caught up with yet.
 *
 * The other half of showing a gesture before the producer has answered it, and it exists BECAUSE
 * of it: a gesture that writes its own control optimistically — a checked facet value, a selected
 * page — leaves the regions it cannot predict showing a state the user has already moved past.
 * The grid, the counts and the totals are rebuilt by the producer, so no client-side transform can
 * project them; all a view can honestly do is say so. Without the optimistic write the whole
 * screen would simply be late TOGETHER, and nothing would need marking.
 *
 * A region is named by the CONSUMER — this module compares scope strings and never interprets
 * one, so no vocabulary of any particular product reaches the package.
 *
 * A set rather than a flag, because several gestures can hold the same region: three clicks in a
 * row must not un-mark it when the first answer arrives.
 *
 * Framework-agnostic, same store protocol as its sibling (`subscribe` + `getVersion`), and
 * independent of `../actions`: what feeds it is a dispatch's lifetime today and a producer cursor
 * later, which is a change of caller rather than a change here.
 */

/** A region of displayed state, named by the consumer (`'results'`, `'cart'`, …). */
export type StaleScope = string;

export interface StaleScopes {
  /**
   * Records that this dispatch leaves `scopes` behind until it settles. An id already tracked is
   * ignored, and an empty `scopes` marks nothing — that is how a gesture the producer answers
   * without rebuilding anything declares itself.
   */
  track: (id: string, scopes: readonly StaleScope[]) => void;
  /** The dispatch is over. Its regions come back up to date unless another dispatch still holds them. */
  settle: (id: string) => void;
  /** The one thing a view asks: should this region be shown as behind? */
  isStale: (scope: StaleScope) => boolean;
  /**
   * Pairs with {@link StaleScopes.getVersion} as an external store: notified whenever that version
   * moves. Returns the unsubscribe.
   */
  subscribe: (listener: () => void) => () => void;
  /**
   * Changes only when the set of stale regions actually changes, so a second gesture against an
   * already-behind region costs no re-read.
   */
  getVersion: () => number;
}

export function createStaleScopes(): StaleScopes {
  const held = new Map<string, readonly StaleScope[]>();
  const holders = new Map<StaleScope, number>();
  const listeners = new Set<() => void>();
  let version = 0;

  /**
   * Over a copy, so a listener that unsubscribes while being notified cannot mutate the set mid-iteration.
   */
  function changed(): void {
    version += 1;
    for (const listener of [...listeners]) {
      listener();
    }
  }

  /**
   * Moves the holder count of every scope by `delta`, and answers whether the set of stale scopes
   * crossed a boundary — a scope gaining its first holder, or losing its last.
   */
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
