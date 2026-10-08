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

// A union, not `string`: a misspelled scope fails silently (nothing ever dims).
export type AppStaleScope = 'results';

export type DispatchProgress = DispatchQueue & {
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

/** True while an outstanding gesture will rebuild `scope`, i.e. what is on screen is outdated. */
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

/** Built once so the whole app shares a single dispatch queue. */
export function useTrackedDispatch<TMessage>(
  source: DispatchSource<TMessage>
): TrackedDispatch<TMessage> {
  const [tracker] = useState<DispatchTracker<TMessage>>(() => createDispatchTracker(source));
  return useMemo(() => ({onAction: tracker.dispatch, progress: tracker}), [tracker]);
}
