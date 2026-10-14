import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';

export interface RequestState {
  /** A state-changing action is in flight, so the results on screen are about to be rebuilt. */
  actionInFlight: boolean;
  /** The active turn's controls are disabled until the request in flight ends. */
  locked: boolean;
  /** Moves when a state-changing request ends, which releases every optimistic hold. */
  settledRequests: number;
}

const IDLE: RequestState = {actionInFlight: false, locked: false, settledRequests: 0};

const RequestStateContext = createContext<RequestState>(IDLE);

export const RequestStateProvider = RequestStateContext.Provider;

export function useRequestState(): RequestState {
  return useContext(RequestStateContext);
}

/** Lookups that change no state, so they never lock the surface (facet search runs while typing). */
const LOOKUP_ACTIONS = new Set(['search', 'clearSearch', 'fetchSuggestions']);

export function isLookup(message: A2UIClientEventMessage): boolean {
  const name = (message as {userAction?: {name?: unknown}}).userAction?.name;
  return typeof name === 'string' && LOOKUP_ACTIONS.has(name);
}

export interface RequestTracker {
  inFlight: number;
  settled: number;
  track: (send: () => Promise<void> | void) => Promise<void>;
}

export function useRequestTracker(): RequestTracker {
  const [inFlight, setInFlight] = useState(0);
  const [settled, setSettled] = useState(0);

  const track = useCallback(async (send: () => Promise<void> | void) => {
    setInFlight((count) => count + 1);
    try {
      await send();
    } finally {
      setInFlight((count) => count - 1);
      setSettled((count) => count + 1);
    }
  }, []);

  return useMemo(() => ({inFlight, settled, track}), [inFlight, settled, track]);
}
