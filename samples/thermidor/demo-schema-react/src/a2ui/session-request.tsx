import {
  createContext,
  startTransition,
  useCallback,
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
 * What the surfaces read from the session: its request in flight, and why the last action failed.
 */
export type SessionRequestSource = Pick<Session, 'subscribe' | 'getSnapshot'>;

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
};

const SessionRequestContext = createContext<SessionRequestSource>(IDLE);

/** Shares the session's request state with the surfaces; `AppShell` passes the session itself. */
export const SessionRequestProvider = SessionRequestContext.Provider;

/** Facet searches, typing in the search box and recent-query edits keep the surface usable. */
const NON_BLOCKING_ACTIONS: ComponentActionNames<typeof ComponentContractsSchema> = {
  CategoryFacet: ['clearSearch', 'search', 'showMoreSearchResults'],
  QuerySuggestions: ['fetchSuggestions', 'clearRecentQueries', 'removeRecentQuery'],
  RegularFacet: ['clearSearch', 'search', 'showMoreSearchResults'],
};

/** A failed suggestion or recent-query edit only leaves the search box as it was. */
const SILENT_FAILURES: ComponentActionNames<typeof ComponentContractsSchema> = {
  QuerySuggestions: ['fetchSuggestions', 'clearRecentQueries', 'removeRecentQuery'],
};

function lists(
  actions: ComponentActionNames<typeof ComponentContractsSchema>,
  {component, name}: Pick<ActionRequest, 'component' | 'name'>
): boolean {
  const byComponent: Partial<Record<string, readonly string[]>> = actions;
  return byComponent[component]?.includes(name) ?? false;
}

/** Whether a request locks the active surface: every one but those in `NON_BLOCKING_ACTIONS`. */
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
 * Whether the last action of `component` named `name` failed, to read once its dispatch resolves,
 * which it does either way.
 */
export function useActionFailed(): (component: string, name: string) => boolean {
  const source = useContext(SessionRequestContext);
  return useCallback(
    (component, name) => {
      const {actionError} = source.getSnapshot();
      return actionError?.component === component && actionError.name === name;
    },
    [source]
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCachePolicy(policy: unknown): boolean {
  return (
    isRecord(policy) &&
    typeof policy['ttlMs'] === 'number' &&
    Number.isFinite(policy['ttlMs']) &&
    policy['ttlMs'] > 0
  );
}

/** Whether `actions` is a valid announcement: every entry a record, its `cache` absent or valid. */
function isValidAnnouncement(actions: unknown): actions is Record<string, unknown> {
  return (
    isRecord(actions) &&
    Object.values(actions).every(
      (action) =>
        isRecord(action) && (action['cache'] === undefined || isCachePolicy(action['cache']))
    )
  );
}

/**
 * Whether the producer's latest valid `concurrentActions` announcement for `surfaceId` lists
 * `name`, read from the session's activity log as the session reads it (ADR-020): a malformed
 * announcement leaves the previous one in force. The session sends such an
 * action dispatched from that surface at once, whatever request is in flight, and never makes it
 * the session's request.
 */
export function announcesConcurrent(
  {initialization, turns}: Pick<SessionSnapshot, 'initialization' | 'turns'>,
  surfaceId: string,
  name: string
): boolean {
  let latest: Record<string, unknown> | undefined;
  const activities = [
    ...(initialization?.activities ?? []),
    ...turns.flatMap((turn) => turn.response.activities),
  ];
  for (const {metadata} of activities) {
    const announcements = metadata?.['concurrentActions'];
    if (isRecord(announcements) && isValidAnnouncement(announcements[surfaceId])) {
      latest = announcements[surfaceId];
    }
  }
  return latest !== undefined && Object.hasOwn(latest, name);
}

/** An action that `useLatestWhenFree` sends from a surface. */
export interface SurfaceAction {
  surfaceId: string;
  name: string;
}

/**
 * Sends the latest `value` once the session is free, unless it was already sent. The session
 * withholds a dispatch made while another request is in flight, so a value that changes meanwhile
 * replaces the one waiting. A falsy value is never sent, and lets the next value be sent even when
 * it repeats the last one.
 *
 * When the producer announces `concurrent`'s action as concurrent on its surface, the session sends
 * it whatever is in flight, so the value is sent at once.
 */
export function useLatestWhenFree<T>(
  value: T,
  send: (value: NonNullable<T>) => void,
  concurrent?: SurfaceAction
): void {
  const source = useContext(SessionRequestContext);
  const lastSent = useRef<T | undefined>(undefined);
  const latestSend = useRef(send);
  latestSend.current = send;
  const surfaceId = concurrent?.surfaceId;
  const concurrentName = concurrent?.name;

  useEffect(() => {
    if (!value) {
      lastSent.current = undefined;
      return;
    }
    const flush = () => {
      const snapshot = source.getSnapshot();
      const free =
        snapshot.request === undefined ||
        (surfaceId !== undefined &&
          concurrentName !== undefined &&
          announcesConcurrent(snapshot, surfaceId, concurrentName));
      if (free && value !== lastSent.current) {
        lastSent.current = value;
        latestSend.current(value as NonNullable<T>);
      }
    };
    flush();
    return source.subscribe(flush);
  }, [source, value, surfaceId, concurrentName]);
}

/**
 * The state of node `nodeId` on surface `surfaceId`, at its `/state/<nodeId>` pointer. A write
 * elsewhere in the session state keeps its identity.
 */
export function nodeState(
  state: SessionSnapshot['state'],
  surfaceId: string,
  nodeId: string
): unknown {
  const surfaceState = state[surfaceId];
  const nodes = isRecord(surfaceState) ? surfaceState['state'] : undefined;
  return isRecord(nodes) ? nodes[nodeId] : undefined;
}

/** Reads the session's current snapshot, outside of rendering. */
export function useReadSnapshot(): () => SessionSnapshot {
  const source = useContext(SessionRequestContext);
  return source.getSnapshot;
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

const retiredSessions = new WeakSet<object>();

/** Drops the prompts waiting on `session`, which the page no longer shows. */
export function retire(session: object): void {
  retiredSessions.add(session);
}

/**
 * Sends `prompt` once the session is free, first cancelling a suggestion in flight so that it never
 * holds the submit back. Only a producer that does not announce `fetchSuggestions` as concurrent
 * makes a suggestion the session's request; its cancelled request may still hold the producer's
 * turn slot, and the session's conflict retry absorbs the prompt's `409`. A session retired
 * meanwhile gets nothing.
 */
export async function submitQuery(session: QuerySubmitter, prompt: string): Promise<void> {
  const {request} = session.getSnapshot();
  if (request) {
    if (isFetchSuggestions(request)) {
      session.cancel();
    }
    await whenFree(session);
    if (retiredSessions.has(session)) {
      return;
    }
  }
  return session.dispatchAction({name: 'submitPrompt', payload: {prompt}});
}

/**
 * Starts a gesture with React's `useOptimistic`: unless a request is in flight, applies the
 * optimistic update and sends the gesture in a transition that lasts until `send`'s promise
 * settles, so the optimistic value shows until then. The renderer's dispatch returns the
 * promise of its `onAction`, `session.dispatchAction`, which settles once the session has
 * answered the gesture.
 */
export function useGesture(): (optimistic: () => void, send: () => void | Promise<void>) => void {
  const source = useContext(SessionRequestContext);
  return (optimistic, send) => {
    if (source.getSnapshot().request !== undefined) {
      return;
    }
    startTransition(async () => {
      optimistic();
      await send();
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
