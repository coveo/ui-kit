import type {CategoryFacetAction, CategoryFacetProps} from '@coveo/thermidor-schema/zod3';
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
  const {value: values, dispatchOptimistic} = useOptimisticValue(
    props.values ?? NO_VALUES,
    dispatch
  );

  const descendInto = (node: CategoryNode) => {
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
    });
  };

  // Going up reveals siblings we can't reconstruct locally, so nothing is held.
  const clearPath = () => {
    dispatch({event: {name: 'clearSelectedPath', context: {}}});
  };

  const selectAncestor = (path: string[]) => {
    dispatch({event: {name: 'selectPath', context: {path}}});
  };

  return {values, descendInto, clearPath, selectAncestor};
}
