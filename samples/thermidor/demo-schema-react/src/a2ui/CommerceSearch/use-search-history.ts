import {useEffect, useRef, useState} from 'react';
import type {CommerceSearchAction, RestoreStatePayload} from '@coveo/thermidor-schema';
import {
  useActionError,
  useLatestWhenFree,
  useSessionBusy,
  useSurfaceActionInFlight,
} from '../session-request.js';
import {buildRestoreSnapshot} from './restore-snapshot.js';

/** The part of a renderer component context that the search history reads. */
export interface SearchSurfaceContext {
  componentModel: {id: string};
  dataContext: {
    surface: {id: string};
    dataModel: {
      get(path: string): unknown;
      subscribe(path: string, onChange: () => void): {unsubscribe(): void};
    };
  };
  surfaceComponents: {entries: Iterable<[string, {type: string}]>};
  dispatchAction(action: CommerceSearchAction): Promise<void>;
}

const HISTORY_KEY = 'thermidorSearch';

interface SearchHistoryEntry {
  surfaceId: string;
  snapshot: RestoreStatePayload;
}

/**
 * What to do with the answer of this surface's action in flight: replace the entry a restore
 * restored, or leave the history alone once the shopper has moved to another entry.
 */
type RestoreAnswer = 'replace' | 'ignore';

function entryOf(state: unknown): SearchHistoryEntry | undefined {
  return (state as Record<string, SearchHistoryEntry> | null)?.[HISTORY_KEY];
}

function snapshotOf(context: SearchSurfaceContext): RestoreStatePayload | undefined {
  const nodes = Array.from(context.surfaceComponents.entries, ([id, {type}]) => ({id, type}));
  return buildRestoreSnapshot(nodes, (id) => context.dataContext.dataModel.get(`/state/${id}`));
}

/**
 * Keeps the browser history in step with a commerce-search surface: each search the surface
 * settles on becomes a history entry, and going back or forward to one of its entries restores
 * that search with `restoreState`.
 */
export function useSearchHistory(context: SearchSurfaceContext): void {
  const surfaceId = context.dataContext.surface.id;
  const busy = useSessionBusy();
  // The surface may hold its state before it mounts, so its first render counts as a change.
  const [stateVersion, setStateVersion] = useState(1);
  const recordedVersion = useRef(0);
  // A restore's answer replaces the entry it restored instead of pushing a new one, so the entries
  // ahead of it stay reachable with forward.
  const restoreAnswer = useRef<RestoreAnswer | undefined>(undefined);
  const [pendingRestore, setPendingRestore] = useState<RestoreStatePayload>();
  const actionError = useActionError(surfaceId);
  const actionInFlight = useSurfaceActionInFlight(surfaceId);

  useEffect(() => {
    if (actionError) {
      restoreAnswer.current = undefined;
    }
  }, [actionError]);

  useEffect(() => {
    const subscription = context.dataContext.dataModel.subscribe('/state', () =>
      setStateVersion((version) => version + 1)
    );
    return () => subscription.unsubscribe();
  }, [context]);

  useEffect(() => {
    if (busy || stateVersion === recordedVersion.current) {
      return;
    }
    recordedVersion.current = stateVersion;
    const snapshot = snapshotOf(context);
    if (!snapshot) {
      return;
    }
    const current = entryOf(window.history.state);
    if (
      current?.surfaceId === surfaceId &&
      JSON.stringify(current.snapshot) === JSON.stringify(snapshot)
    ) {
      restoreAnswer.current = undefined;
      return;
    }
    if (pendingRestore) {
      return;
    }
    const answer = restoreAnswer.current;
    restoreAnswer.current = undefined;
    if (answer === 'ignore') {
      return;
    }
    const entry = {[HISTORY_KEY]: {surfaceId, snapshot}};
    if (answer === 'replace') {
      window.history.replaceState(entry, '');
    } else {
      window.history.pushState(entry, '');
    }
  }, [busy, stateVersion, context, surfaceId, pendingRestore]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const entry = entryOf(event.state);
      if (actionInFlight) {
        restoreAnswer.current = 'ignore';
      }
      setPendingRestore(entry?.surfaceId === surfaceId ? entry.snapshot : undefined);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [surfaceId, actionInFlight]);

  useLatestWhenFree(pendingRestore, (snapshot) => {
    restoreAnswer.current = 'replace';
    setPendingRestore(undefined);
    void context.dispatchAction({event: {name: 'restoreState', context: snapshot}});
  });
}
