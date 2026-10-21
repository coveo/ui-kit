import {createContext, startTransition, useContext} from 'react';
import type {Session} from '@coveo/thermidor';

/** What the surfaces read from the session: its request in flight, and when it has answered. */
export type SessionRequestSource = Pick<Session, 'request' | 'subscribe' | 'whenSettled'>;

const IDLE: SessionRequestSource = {
  request: undefined,
  subscribe: () => () => {},
  whenSettled: () => Promise.resolve(),
};

const SessionRequestContext = createContext<SessionRequestSource>(IDLE);

/** Shares the session's request state with the surfaces; `AppShell` passes the session itself. */
export const SessionRequestProvider = SessionRequestContext.Provider;

/**
 * Starts a gesture with React's `useOptimistic`: applies the optimistic update and sends the
 * gesture in a transition that lasts until the session has answered it, so the optimistic value
 * shows until then.
 */
export function useGesture(): (optimistic: () => void, send: () => void) => void {
  const source = useContext(SessionRequestContext);
  return (optimistic, send) => {
    startTransition(async () => {
      optimistic();
      const answered = source.whenSettled();
      send();
      await answered;
    });
  };
}
