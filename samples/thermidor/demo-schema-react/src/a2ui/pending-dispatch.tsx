import {createContext, useContext, useMemo, useState, useSyncExternalStore} from 'react';
import {
  createDispatchTracker,
  createStaleScopes,
  type DispatchQueue,
  type DispatchSource,
  type DispatchTracker,
  type StaleScopes,
} from '@coveo/thermidor';

export type {CoalesceIntent, DispatchId, DispatchOutcome, IssuedDispatch} from '@coveo/thermidor';

/**
 * The regions this app names. A union rather than a bare string, because both failure modes of a
 * misspelled region are silent: a reader asking for one that nothing marks never dims, and a
 * gesture marking one that nothing reads never dims either.
 */
export type AppStaleScope = 'results';

/**
 * What the app reads about dispatches in progress — the queue the optimistic controller reads,
 * plus the stale regions a view dims. It is {@link DispatchTracker} minus its one method, which no
 * reader of this context needs.
 */
export type DispatchProgress = DispatchQueue & {
  /** Which regions of the screen the producer has not caught up with. */
  stale: StaleScopes;
};

const IDLE: DispatchProgress = {
  lastIssued: () => undefined,
  inFlight: () => undefined,
  declareGesture: () => () => {},
  stale: createStaleScopes(),
};

const DispatchProgressContext = createContext<DispatchProgress>(IDLE);

export const DispatchProgressProvider = DispatchProgressContext.Provider;

export function useDispatchProgress(): DispatchProgress {
  return useContext(DispatchProgressContext);
}

/**
 * For a component that renders a region rather than dispatching against it: true while a gesture
 * the producer answers by rebuilding that region is outstanding, so what is on screen describes a
 * state the user has already moved past.
 */
export function useStale(scope: AppStaleScope): boolean {
  const {stale} = useContext(DispatchProgressContext);
  return useSyncExternalStore(
    stale.subscribe,
    () => stale.isStale(scope),
    () => false
  );
}

export interface TrackedDispatch<TMessage> {
  onAction: (message: TMessage) => Promise<void>;
  progress: DispatchProgress;
}

/**
 * Binds the package's dispatch tracker to React. The tracker owns everything stateful — the queue
 * ports, the stale store, the declaration forced onto the next dispatch; this hook only builds it
 * once and hands its `dispatch` to `A2UIProvider` as `onAction`, so there is exactly one queue for
 * the whole app and every dispatch marks only the regions the gesture that sent it declared.
 */
export function useTrackedDispatch<TMessage>(
  source: DispatchSource<TMessage>
): TrackedDispatch<TMessage> {
  const [tracker] = useState<DispatchTracker<TMessage>>(() => createDispatchTracker(source));
  return useMemo(() => ({onAction: tracker.dispatch, progress: tracker}), [tracker]);
}
