/**
 * ============================================================================
 * Observable store
 * ============================================================================
 *
 * A plain, in-memory observable store holding the session runtime state
 * (`{ turns, activeTurnId?, sessionId?, sessionToken? }`). It exposes a
 * `subscribe(listener) → unsubscribe` seam and notifies every registered
 * subscriber exactly once per change. It replaces the RTK slice + state port;
 * there is no Redux here (ADR-010).
 */

/**
 * A function that removes a previously-registered store listener.
 */
export type Unsubscribe = () => void;

/**
 * The runtime state held by the observable store.
 *
 * The turn shape is a type parameter so the store can be constructed before the
 * reshaped runtime `Turn` type lands, and pinned to it once it does.
 */
export interface SessionStoreState<TTurn> {
  /**
   * The ordered turn history for the session.
   */
  turns: readonly TTurn[];

  /**
   * The id of the currently active turn, or `undefined` when no turns exist.
   */
  activeTurnId?: string;

  /**
   * The server-assigned session identifier, used to continue multi-turn
   * conversations. A continuity key, not a replay mechanism.
   */
  sessionId?: string;

  /**
   * The server-assigned session token for request-authentication continuity.
   */
  sessionToken?: string;
}

/**
 * The observable store handle returned by {@link createSessionStore}.
 */
export interface SessionStore<TTurn> {
  /**
   * Returns the current store state snapshot.
   */
  getState(): SessionStoreState<TTurn>;

  /**
   * Replaces the current state and notifies every registered subscriber once.
   *
   * @param next - Either the next state, or a producer computing it from the
   *   current state.
   */
  setState(
    next:
      | SessionStoreState<TTurn>
      | ((current: SessionStoreState<TTurn>) => SessionStoreState<TTurn>)
  ): void;

  /**
   * Registers a listener invoked once per change to the store state.
   *
   * @param listener - Invoked after each state change.
   * @returns A function that unsubscribes the listener and stops all further
   *   notifications to it.
   */
  subscribe(listener: () => void): Unsubscribe;
}

/**
 * Creates a plain observable store seeded with `initialState`.
 *
 * The store owns no singletons and no module-level mutable state, so two stores
 * created from identical initial state share nothing (ADR-010).
 */
export function createSessionStore<TTurn>(
  initialState: SessionStoreState<TTurn>
): SessionStore<TTurn> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState() {
      return state;
    },

    setState(next) {
      const nextState =
        typeof next === 'function'
          ? (next as (current: SessionStoreState<TTurn>) => SessionStoreState<TTurn>)(state)
          : next;

      if (nextState === state) {
        return;
      }

      state = nextState;
      for (const listener of listeners) {
        listener();
      }
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
