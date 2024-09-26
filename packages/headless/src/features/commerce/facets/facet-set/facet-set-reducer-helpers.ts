import {CommerceFacetSetState} from './facet-set-state.js';
import {CategoryFacetValueRequest} from './interfaces/request.js';

export function handleCategoryFacetNestedNumberOfValuesUpdate(
  state: CommerceFacetSetState,
  payload: {facetId: string; numberOfValues: number}
) {
  const {facetId, numberOfValues} = payload;
  let selectedValue = state[facetId]?.request
    .values[0] as CategoryFacetValueRequest;
  if (!selectedValue) {
    return;
  }

  while (selectedValue.children.length && selectedValue?.state !== 'selected') {
    selectedValue = selectedValue.children[0];
  }
  selectedValue.retrieveCount = numberOfValues;
}
