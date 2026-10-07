import {useCallback} from 'react';
import {useOptimisticValue} from './use-optimistic-value.js';

/**
 * The two gestures the input needs, shaped as the A2-UI actions they are — a subset of every facet
 * action union that carries a facet search, so a component passes its OWN typed dispatch and no
 * mapper sits in between.
 */
export type FacetSearchAction =
  | {event: {name: 'search'; context: {query: string}}}
  | {event: {name: 'clearSearch'; context?: unknown}};

export interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  /** Empties the field at once, dispatching the clear whose answer releases it. */
  reset: () => void;
}

/**
 * Keeps the facet search input responsive by holding what the user typed until the backend has
 * answered that keystroke's own dispatch, while dispatching a validated `search` action on every
 * change. In-progress input never touches the shared A2-UI data model.
 *
 * Holding matters because every converse response carries the facet's whole node,
 * `facetSearch.query` included: a response to an unrelated gesture reports the query the backend
 * knew at the time, so adopting it verbatim empties the field mid-typing.
 *
 * Both gestures are absolute writes of the query — `search` and `clearSearch` SET it rather than
 * amending it — so the coordinator supersedes every queued write but the one in flight: a burst of
 * keystrokes collapses to the request already dispatched plus the latest one still queued, not to a
 * single request. And both are answered from `platformClient.facetSearch`, facet values only with no
 * product query, so a pending one leaves the results on screen accurate.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatch: (action: FacetSearchAction) => void
): OptimisticFacetSearch {
  const {value, dispatchOptimistic} = useOptimisticValue(backendQuery, dispatch);

  const onQueryChange = useCallback(
    (next: string) => {
      dispatchOptimistic({
        action: {event: {name: 'search', context: {query: next}}},
        next,
        coalesce: 'absolute',
        invalidates: [],
      });
    },
    [dispatchOptimistic]
  );

  const reset = useCallback(() => {
    dispatchOptimistic({
      action: {event: {name: 'clearSearch', context: {}}},
      next: '',
      coalesce: 'absolute',
      invalidates: [],
    });
  }, [dispatchOptimistic]);

  return {query: value, onQueryChange, reset};
}
