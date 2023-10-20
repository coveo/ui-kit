import {CommerceCategoryFacetSetState} from './category-facet-set-state';

export function handleCategoryFacetDeselectAll(
  state: CommerceCategoryFacetSetState,
  facetId: string
) {
  const slice = state[facetId];

  if (!slice) {
    return;
  }

  slice.request.numberOfValues = slice.initialNumberOfValues;
}
