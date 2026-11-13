import {useEffect, useRef, useState} from 'react';
import type {RestoreStatePayload} from '@coveo/thermidor-schema';
import {useLatestWhenFree} from '../../../../demo-schema-react/src/a2ui/session-request.js';
import {buildRestoreSnapshot} from '../../../../demo-schema-react/src/a2ui/CommerceSearch/restore-snapshot.js';
import type {SearchSurfaceContext} from '../../../../demo-schema-react/src/a2ui/CommerceSearch/use-search-history.js';
import {useReturnedVisit} from './returned-visit.js';

function snapshotOf(context: SearchSurfaceContext): RestoreStatePayload | undefined {
  const nodes = Array.from(context.surfaceComponents.entries, ([id, {type}]) => ({id, type}));
  return buildRestoreSnapshot(nodes, (id) => context.dataContext.dataModel.get(`/state/${id}`));
}

/**
 * When the shopper returns to this search with Back, sends `restoreState` with the search the
 * surface shows, its facets and sort included: the server runs it again and makes this surface
 * the one the assistant answers about. Sent once the session is free.
 */
export function useRestoreOnReturn(context: SearchSurfaceContext): void {
  const returned = useReturnedVisit();
  const handled = useRef<number | undefined>(undefined);
  const [pending, setPending] = useState<RestoreStatePayload>();

  useEffect(() => {
    if (returned === undefined || handled.current === returned) {
      return;
    }
    handled.current = returned;
    const snapshot = snapshotOf(context);
    if (snapshot) {
      setPending(snapshot);
    }
  }, [returned, context]);

  useLatestWhenFree(pending, (snapshot) => {
    setPending(undefined);
    void context.dispatchAction({event: {name: 'restoreState', context: snapshot}});
  });
}
