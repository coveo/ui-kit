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
  ActionError,
  ActionRequest,
  ComponentActionNames,
  Session,
  SessionRequest,
  SessionSnapshot,
} from '@coveo/thermidor';
import type {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';

/**
 * What the surfaces read from the session: its request and concurrent actions in flight, why the
 * last action failed, and whether an action is sent beside the request in flight.
 */
export type SessionRequestSource = Pick<Session, 'subscribe' | 'getSnapshot'> &
  Partial<Pick<Session, 'isConcurrent'>>;

const IDLE_SNAPSHOT: SessionSnapshot = {
  turns: [],
  initialization: undefined,
  surfaces: [],
  a2uiMessages: [],
  state: {},
  request: undefined,
  actionError: undefined,
  concurrentRequests: [],
  concurrentFailures: [],
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

/** The last failed action, while the session still reports it. A failed suggestion is not reported. */
export function useReportedActionError(): ActionError | undefined {
  const source = useContext(SessionRequestContext);
  return useSyncExternalStore(
    source.subscribe,
    () => {
      const {actionError} = source.getSnapshot();
      return actionError && !lists(SILENT_FAILURES, actionError) ? actionError : undefined;
    },
    () => undefined
  );
}

/**
 * Why the last action dispatched from `surfaceId` failed, while the session still reports it. A
 * failed suggestion is not reported.
 */
export function useActionError(surfaceId: string): string | undefined {
  const actionError = useReportedActionError();
  return actionError?.surfaceId === surfaceId ? actionError.message : undefined;
}

/**
 * Why the last action dispatched from the node `componentId` of `surfaceId` failed, while the
 * session still reports it. A failed suggestion is not reported.
 */
export function useComponentActionError(
  surfaceId: string,
  componentId: string
): string | undefined {
  const actionError = useReportedActionError();
  return actionError?.surfaceId === surfaceId && actionError.sourceComponentId === componentId
    ? actionError.message
    : undefined;
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
 * When the session sends `concurrent`'s action from its surface at once, whatever is in flight
 * (`session.isConcurrent`), the value is sent at once.
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
          source.isConcurrent?.({surfaceId, name: concurrentName}) === true);
      if (free && value !== lastSent.current) {
        lastSent.current = value;
        latestSend.current(value as NonNullable<T>);
      }
    };
    flush();
    return source.subscribe(flush);
  }, [source, value, surfaceId, concurrentName]);
}

/** An action dispatched from a node. */
export interface NodeAction extends SurfaceAction {
  sourceComponentId: string;
}

function sameNodeAction(
  a: Pick<NodeAction, 'surfaceId' | 'sourceComponentId' | 'name'>,
  b: NodeAction
): boolean {
  return (
    a.surfaceId === b.surfaceId && a.sourceComponentId === b.sourceComponentId && a.name === b.name
  );
}

/**
 * Whether the latest dispatch of `action` awaits its answer beside the session's request, as the
 * producer announces it concurrent (ADR-020). Read once an older dispatch resolves, it tells that a
 * later one superseded it.
 */
export function isConcurrentInFlight(snapshot: SessionSnapshot, action: NodeAction): boolean {
  return snapshot.concurrentRequests.some((request) => sameNodeAction(request, action));
}

/**
 * Whether the session reports the failure of `action`, on the path its dispatch took: `concurrent`
 * when `session.isConcurrent` said so just before it was dispatched. A concurrent action reports
 * the failure of its node's latest dispatch in `concurrentFailures`, kept until the node dispatches
 * it again; an action sent as the session's request reports it in `actionError`, cleared once
 * anything else is sent. Each path reads only its own, so a failure left on the other path, before
 * the producer's announcement changed, does not count.
 */
export function hasFailed(
  snapshot: SessionSnapshot,
  action: NodeAction,
  concurrent: boolean
): boolean {
  const {actionError, concurrentFailures} = snapshot;
  return concurrent
    ? concurrentFailures.some((failure) => sameNodeAction(failure, action))
    : actionError !== undefined && sameNodeAction(actionError, action);
}

/** Whether the latest dispatch of `action` awaits its answer beside the session's request. */
export function useConcurrentInFlight(action: NodeAction | undefined): boolean {
  const source = useContext(SessionRequestContext);
  const {surfaceId, sourceComponentId, name} = action ?? {};
  return useSyncExternalStore(
    source.subscribe,
    () =>
      surfaceId !== undefined &&
      sourceComponentId !== undefined &&
      name !== undefined &&
      isConcurrentInFlight(source.getSnapshot(), {surfaceId, sourceComponentId, name}),
    () => false
  );
}

/**
 * How a dispatch ended: `applied` when its answer was applied, `failed` when the session reports its
 * failure, `superseded` when a later dispatch of its node action is in flight, which brings the
 * answer to read.
 */
export type DispatchOutcome = 'applied' | 'failed' | 'superseded';

/** Whether the session sends `action` beside its request (`session.isConcurrent`), as it changes. */
export function useIsConcurrent(action: SurfaceAction | undefined): boolean {
  const source = useContext(SessionRequestContext);
  const {surfaceId, name} = action ?? {};
  return useSyncExternalStore(
    source.subscribe,
    () =>
      surfaceId !== undefined &&
      name !== undefined &&
      source.isConcurrent?.({surfaceId, name}) === true,
    () => false
  );
}

/**
 * Dispatches `action` with `dispatch`, and resolves with how it ended once it resolves, on the path
 * it takes: concurrently when `session.isConcurrent` says so, as the session's request otherwise.
 *
 * A concurrent dispatch reads its node's latest dispatch in `concurrentRequests` and
 * `concurrentFailures`. An ordinary one is best effort: it failed when `actionError` names it as it
 * resolves, so a failure that another dispatch cleared meanwhile reads as applied, and so does a
 * dispatch cancelled for a prompt.
 */
export function useDispatchOutcome(): (
  action: NodeAction,
  dispatch: () => unknown
) => Promise<DispatchOutcome> {
  const source = useContext(SessionRequestContext);
  return useCallback(
    async (action, dispatch) => {
      const concurrent = source.isConcurrent?.(action) === true;
      await dispatch();
      const snapshot = source.getSnapshot();
      if (concurrent && isConcurrentInFlight(snapshot, action)) {
        return 'superseded';
      }
      return hasFailed(snapshot, action, concurrent) ? 'failed' : 'applied';
    },
    [source]
  );
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
