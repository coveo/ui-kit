import type {CategoryFacetAction, CategoryFacetProps} from '@coveo/thermidor-schema/zod3';
import {useDispatchProgress} from '../pending-dispatch.js';
import {useOptimisticValue} from '../use-optimistic-value.js';

type CategoryFacetValues = NonNullable<CategoryFacetProps['values']>;

type CategoryNode = {value: string; path: string[]; numberOfResults: number};

const NO_VALUES: CategoryFacetValues = {ancestry: [], children: [], selected: null};

export interface OptimisticCategoryFacet {
  /** The tree to render: the producer's, with this facet's outstanding gesture applied. */
  values: CategoryFacetValues;
  /** Moving DOWN into a node, the one direction this facet can show before the producer answers. */
  descendInto: (node: CategoryNode) => void;
  /** Dropping the whole selection back to the root; the producer owns the resulting tree. */
  clearPath: () => void;
  /** Moving UP to an ancestor; the producer owns the sibling set revealed at that level. */
  selectAncestor: (path: string[]) => void;
}

/**
 * The category facet's tree, and the gestures made against it. Descending holds the clicked node
 * on screen; going up and clearing hold no value and only dim the result set. All three rebuild
 * the result set, so each carries `invalidates: ['results']`.
 */
export function useOptimisticCategoryFacet(
  props: CategoryFacetProps,
  dispatch: (action: CategoryFacetAction) => void
): OptimisticCategoryFacet {
  const {declareGesture} = useDispatchProgress();
  const {value: values, dispatchOptimistic} = useOptimisticValue(
    props.values ?? NO_VALUES,
    dispatch
  );

  const descendInto = (node: CategoryNode) => {
    // The node becomes the selection and its own children are unknown until the backend answers.
    //
    // `selectPath` SETS the path, so a queued descent into a sibling cannot change where a later
    // one lands and may be replaced by it.
    dispatchOptimistic({
      action: {event: {name: 'selectPath', context: {path: node.path}}},
      next: (current) => ({
        ...current,
        // Idempotent: two gestures onto the same node compose when the first is already in
        // flight, and the producer ends on that node once, not twice.
        ancestry: [
          ...(current.ancestry ?? []).filter((step) => step.path.join('/') !== node.path.join('/')),
          node,
        ],
        selected: node,
        children: [],
      }),
      coalesce: 'absolute',
      // Descending selects a new path, so the producer rebuilds the result set.
      invalidates: ['results'],
    });
  };

  // Clear and ancestor selection reveal a sibling set no local value can reconstruct, so they hold
  // nothing: declaring the gesture onto the next dispatch dims the result set, the only feedback
  // until the producer answers.
  const dispatchDimmingResults = (action: CategoryFacetAction) => {
    const withdraw = declareGesture({invalidates: ['results']});
    dispatch(action);
    withdraw();
  };

  const clearPath = () => {
    dispatchDimmingResults({event: {name: 'clearSelectedPath', context: {}}});
  };

  const selectAncestor = (path: string[]) => {
    dispatchDimmingResults({event: {name: 'selectPath', context: {path}}});
  };

  return {values, descendInto, clearPath, selectAncestor};
}
