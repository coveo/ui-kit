import type {RestoreStatePayload} from '@coveo/thermidor-schema';
import {useLatestWhenFree} from '../../../../demo-schema-react/src/a2ui/session-request.js';
import {buildRestoreSnapshot} from '../../../../demo-schema-react/src/a2ui/CommerceSearch/restore-snapshot.js';
import type {SearchSurfaceContext} from '../../../../demo-schema-react/src/a2ui/CommerceSearch/use-search-history.js';
import {useReturnedVisit} from './returned-visit.js';

// TODO(a2ui-react context): `context` is deprecated in @a2ui/react 0.16. Build the component
// through `view({node, buildChild})`, read `dataModel`, `componentsModel` and `id` from
// `useA2uiSurface()`, and dispatch with its `dispatchAction(action, node.componentId)`.
function snapshotOf(context: SearchSurfaceContext): RestoreStatePayload | undefined {
  const nodes = Array.from(context.surfaceComponents.entries, ([id, {type}]) => ({id, type}));
  return buildRestoreSnapshot(nodes, (id) => context.dataContext.dataModel.get(`/state/${id}`));
}

/**
 * When the shopper returns to this search with Back, sends `restoreState` with the search the
 * surface shows, its facets and sort included: the server runs it again and makes this surface
 * the one the assistant answers about. Sent once the session is free, and built then, so it
 * includes the answer of an action that was in flight when the shopper left.
 */
export function useRestoreOnReturn(context: SearchSurfaceContext): void {
  const returned = useReturnedVisit();

  useLatestWhenFree(returned, () => {
    const snapshot = snapshotOf(context);
    if (snapshot) {
      void context.dispatchAction({event: {name: 'restoreState', context: snapshot}});
    }
  });
}
