import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import type {
  ActionRequest,
  ComponentActionNames,
  Session,
  SessionRequest,
  SessionSnapshot,
} from '@coveo/thermidor';
import type {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';

/**
 * What the surfaces read from the session: its request in flight, when it has answered, and why the
 * last action failed.
 */
export type SessionRequestSource = Pick<Session, 'subscribe' | 'getSnapshot' | 'sendAndWait'>;

const IDLE_SNAPSHOT: SessionSnapshot = {
  turns: [],
  initialization: undefined,
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

/** Typing in a facet search or in the search box keeps the surface usable. */
const NON_BLOCKING_ACTIONS: ComponentActionNames<typeof ComponentContractsSchema> = {
  CategoryFacet: ['clearSearch', 'search', 'showMoreSearchResults'],
  QuerySuggestions: ['fetchSuggestions'],
  RegularFacet: ['clearSearch', 'search', 'showMoreSearchResults'],
};

/** A failed suggestion only leaves the search box without completions. */
const SILENT_FAILURES: ComponentActionNames<typeof ComponentContractsSchema> = {
  QuerySuggestions: ['fetchSuggestions'],
};

function lists(
  actions: ComponentActionNames<typeof ComponentContractsSchema>,
  {component, name}: Pick<ActionRequest, 'component' | 'name'>
): boolean {
  const byComponent: Partial<Record<string, readonly string[]>> = actions;
  return byComponent[component]?.includes(name) ?? false;
}

/** Whether a request locks the active surface: every one but a facet search or a suggestion. */
export function isBlocking(request: SessionRequest | undefined): boolean {
  return (
    request !== undefined && !(request.kind === 'action' && lists(NON_BLOCKING_ACTIONS, request))
  );
}

/**
 * Why the last action dispatched from `surfaceId` failed, while the session still reports it. A
 * failed suggestion is not reported.
 */
export function useActionError(surfaceId: string): string | undefined {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => {
      const {actionError} = source.getSnapshot();
      return actionError?.surfaceId === surfaceId && !lists(SILENT_FAILURES, actionError)
        ? actionError.message
        : undefined;
    },
    () => undefined
  );
}

/**
 * Sends the latest `value` once the session is free, unless it was already sent. The session
 * withholds a dispatch made while another request is in flight, so a value that changes meanwhile
 * replaces the one waiting. A falsy value is never sent, and lets the next value be sent even when
 * it repeats the last one.
 */
export function useLatestWhenFree<T>(value: T, send: (value: NonNullable<T>) => void): void {
  const source = useContext(SessionRequestContext);
  const lastSent = useRef<T | undefined>(undefined);
  const latestSend = useRef(send);
  latestSend.current = send;

  useEffect(() => {
    if (!value) {
      lastSent.current = undefined;
      return;
    }
    const flush = () => {
      if (source.getSnapshot().request === undefined && value !== lastSent.current) {
        lastSent.current = value;
        latestSend.current(value as NonNullable<T>);
      }
    };
    flush();
    return source.subscribe(flush);
  }, [source, value]);
}

/** What {@link submitQuery} needs from the session. */
export type QuerySubmitter = Pick<
  Session,
  'getSnapshot' | 'subscribe' | 'cancel' | 'dispatchAction'
>;

function isFetchSuggestions(request: SessionRequest | undefined): boolean {
  return request?.kind === 'action' && request.name === 'fetchSuggestions';
}

function whenFree(session: QuerySubmitter): Promise<void> {
  return new Promise((resolve) => {
    const settle = () => {
      if (session.getSnapshot().request === undefined) {
        unsubscribe();
        resolve();
      }
    };
    const unsubscribe = session.subscribe(settle);
    settle();
  });
}

/**
 * Sends `prompt` once the session is free, first cancelling a suggestion in flight so that it never
 * holds the submit back. The cancelled request may still hold the producer's turn slot; the
 * session's conflict retry absorbs the prompt's `409`.
 */
export async function submitQuery(session: QuerySubmitter, prompt: string): Promise<void> {
  const {request} = session.getSnapshot();
  if (request) {
    if (isFetchSuggestions(request)) {
      session.cancel();
    }
    await whenFree(session);
  }
  return session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
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

/** Whether an action dispatched from `surfaceId` is in flight. */
export function useSurfaceActionInFlight(surfaceId: string): boolean {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => {
      const {request} = source.getSnapshot();
      return request?.kind === 'action' && request.surfaceId === surfaceId;
    },
    () => false
  );
}

/** Whether a request is in flight. */
export function useSessionBusy(): boolean {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => source.getSnapshot().request !== undefined,
    () => false
  );
}

/**
 * Whether the active turn's surface is locked by the request in flight: every request but one
 * listed in `NON_BLOCKING_ACTIONS`, such as a facet search.
 */
export function useSurfaceLocked(): boolean {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => isBlocking(source.getSnapshot().request),
    () => false
  );
}
