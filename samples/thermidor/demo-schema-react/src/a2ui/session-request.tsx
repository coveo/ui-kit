import {createContext, startTransition, useContext, useSyncExternalStore} from 'react';
import type {Session, SessionRequest, SessionSnapshot} from '@coveo/thermidor';

/**
 * What the surfaces read from the session: its request in flight, when it has answered, and why the
 * last action failed.
 */
export type SessionRequestSource = Pick<Session, 'subscribe' | 'getSnapshot' | 'sendAndWait'>;

const IDLE_SNAPSHOT: SessionSnapshot = {
  turns: [],
  surfaces: [],
  a2uiMessages: [],
  state: {},
  request: undefined,
  actionError: undefined,
};

const IDLE: SessionRequestSource = {
  getSnapshot: () => IDLE_SNAPSHOT,
  subscribe: () => () => {},
  sendAndWait: (send) => {
    send();
    return Promise.resolve();
  },
};

const SessionRequestContext = createContext<SessionRequestSource>(IDLE);

/** Shares the session's request state with the surfaces; `AppShell` passes the session itself. */
export const SessionRequestProvider = SessionRequestContext.Provider;

/** Typing in a facet search keeps the surface usable. */
const NON_BLOCKING_ACTIONS: ReadonlySet<string> = new Set([
  'search',
  'clearSearch',
  'showMoreSearchResults',
]);

/** Whether a request locks the active surface: every one but a facet search. */
export function isBlocking(request: SessionRequest | undefined): boolean {
  return (
    request !== undefined && !(request.kind === 'action' && NON_BLOCKING_ACTIONS.has(request.name))
  );
}

/** The request the session is sending, from the enclosing provider. */
function useSessionRequest(): SessionRequest | undefined {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => source.getSnapshot().request,
    () => undefined
  );
}

/** Why the last action dispatched from `surfaceId` failed, while the session still reports it. */
export function useActionError(surfaceId: string): string | undefined {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => {
      const {actionError} = source.getSnapshot();
      return actionError?.surfaceId === surfaceId ? actionError.message : undefined;
    },
    () => undefined
  );
}

/** Whether the session is sending a request: it takes one at a time and withholds the others. */
export function useSessionBusy(): () => boolean {
  const source = useContext(SessionRequestContext);
  return () => source.getSnapshot().request !== undefined;
}

/**
 * Starts a gesture with React's `useOptimistic`: unless a request is in flight, applies the
 * optimistic update and sends the gesture in a transition that lasts until the session has
 * answered it, so the optimistic value shows until then.
 */
export function useGesture(): (optimistic: () => void, send: () => void) => void {
  const source = useContext(SessionRequestContext);
  return (optimistic, send) => {
    if (source.getSnapshot().request !== undefined) {
      return;
    }
    startTransition(async () => {
      optimistic();
      await source.sendAndWait(send);
    });
  };
}

/** Whether the active turn's surface is locked by the request in flight. */
export function useSurfaceLocked(): boolean {
  return isBlocking(useSessionRequest());
}
