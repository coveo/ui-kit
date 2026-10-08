import type {CategoryFacetAction, CategoryFacetProps} from '@coveo/thermidor-schema/zod3';
import {useDispatchProgress} from '../pending-dispatch.js';
import {useOptimisticValue} from '../use-optimistic-value.js';

type CategoryFacetValues = NonNullable<CategoryFacetProps['values']>;

type CategoryNode = {value: string; path: string[]; numberOfResults: number};

const NO_VALUES: CategoryFacetValues = {ancestry: [], children: [], selected: null};

export interface OptimisticCategoryFacet {
  values: CategoryFacetValues;
  /** The only direction that can be shown before the producer answers. */
  descendInto: (node: CategoryNode) => void;
  clearPath: () => void;
  selectAncestor: (path: string[]) => void;
}

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
    // `selectPath` SETS the path, so a later descent may replace a queued one.
    dispatchOptimistic({
      action: {event: {name: 'selectPath', context: {path: node.path}}},
      next: (current) => ({
        ...current,
        // Idempotent: a repeat gesture onto an in-flight node must not append it twice.
        ancestry: [
          ...(current.ancestry ?? []).filter((step) => step.path.join('/') !== node.path.join('/')),
          node,
        ],
        selected: node,
        children: [],
      }),
      coalesce: 'absolute',
      invalidates: ['results'],
    });
  };

  // Going up reveals siblings we can't reconstruct locally, so only dim the results.
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
