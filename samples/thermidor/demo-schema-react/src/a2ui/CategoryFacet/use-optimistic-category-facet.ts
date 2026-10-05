import type {CategoryFacetAction, CategoryFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

type CategoryFacetValues = NonNullable<CategoryFacetProps['values']>;

type CategoryNode = {value: string; path: string[]; numberOfResults: number};

const NO_VALUES: CategoryFacetValues = {ancestry: [], children: [], selected: null};

export interface OptimisticCategoryFacet {
  /** The tree to render: the producer's, with this facet's outstanding gesture applied. */
  values: CategoryFacetValues;
  /** Moving DOWN into a node, the one direction this facet can show before the producer answers. */
  descendInto: (node: CategoryNode) => void;
}

/**
 * The category facet's tree, and the one gesture that carries it optimistically.
 *
 * Only the descent. Going back up the ancestry, clearing the path, and the show-more pair all need
 * state no local value holds — the sibling set at that level, or a count — so they stay plain
 * dispatches at their call site, where the absence of an optimistic value is visible.
 */
export function useOptimisticCategoryFacet(
  props: CategoryFacetProps,
  dispatch: (action: CategoryFacetAction) => void
): OptimisticCategoryFacet {
  const {value: values, dispatchOptimistic} = useOptimisticValue(
    props.values ?? NO_VALUES,
    dispatch
  );

  const descendInto = (node: CategoryNode) => {
    // Only the DESCENT is reconstructible: the node becomes the selection and its own children
    // are unknown until the backend answers. Going back up, and clearing, would need the sibling
    // set at that level, which no local state holds — those stay backend-owned.
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
    });
  };

  return {values, descendInto};
}
