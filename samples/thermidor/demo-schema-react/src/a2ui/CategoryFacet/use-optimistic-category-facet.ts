import {useOptimistic} from 'react';
import type {CategoryFacetAction, CategoryFacetProps} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';

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
  dispatch: (action: CategoryFacetAction) => void | Promise<void>
): OptimisticCategoryFacet {
  const [values, addOptimisticValues] = useOptimistic(props.values ?? NO_VALUES);
  const startGesture = useGesture();

  const descendInto = (node: CategoryNode) => {
    startGesture(
      () =>
        addOptimisticValues({
          ...values,
          // A node already on the path (a facet-search result) moves to its end instead of repeating.
          ancestry: [
            ...(values.ancestry ?? []).filter(
              (step) => step.path.join('/') !== node.path.join('/')
            ),
            node,
          ],
          selected: node,
          children: [],
        }),
      () => dispatch({event: {name: 'selectPath', context: {path: node.path}}})
    );
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
