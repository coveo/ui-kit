import {createContext, startTransition, useContext, useSyncExternalStore} from 'react';
import type {Session, SessionRequest} from '@coveo/thermidor';

/** What the surfaces read from the session: its request in flight, and when it has answered. */
export type SessionRequestSource = Pick<Session, 'request' | 'subscribe' | 'sendAndWait'>;

const IDLE: SessionRequestSource = {
  request: undefined,
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

/** Whether an action, sent now, would wait behind a request that locks the surface. */
export function isBlockedAction(source: SessionRequestSource, actionName: string): boolean {
  return isBlocking(source.request) && !NON_BLOCKING_ACTIONS.has(actionName);
}

/** The request the session is sending, from `source` or the enclosing provider. */
export function useSessionRequest(source?: SessionRequestSource): SessionRequest | undefined {
  const context = useContext(SessionRequestContext);
  const session = source ?? context;
  return useSyncExternalStore(
    session.subscribe,
    () => session.request,
    () => undefined
  );
}

/** Whether the session is sending a request: it takes one at a time and withholds the others. */
export function useSessionBusy(): () => boolean {
  const source = useContext(SessionRequestContext);
  return () => source.request !== undefined;
}

/**
 * Starts a gesture with React's `useOptimistic`: unless the surface is locked, applies the
 * optimistic update and sends the gesture in a transition that lasts until the session has
 * answered it, so the optimistic value shows until then.
 */
export function useGesture(): (optimistic: () => void, send: () => void) => void {
  const source = useContext(SessionRequestContext);
  return (optimistic, send) => {
    if (isBlocking(source.request)) {
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
