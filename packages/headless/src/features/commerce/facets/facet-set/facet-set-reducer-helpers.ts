import {CommerceFacetSetState} from './facet-set-state';
import {
  CommerceCategoryFacetValueRequest,
  AnyCommerceFacetRequest,
} from './interfaces/request';

export function handleFacetUpdateNumberOfValues<
  T extends AnyCommerceFacetRequest,
>(facetRequest: T | undefined, numberOfValues: number) {
  if (!facetRequest) {
    return;
  }

  facetRequest.numberOfValues = numberOfValues;
}

export function handleCategoryFacetNestedNumberOfValuesUpdate(
  state: CommerceFacetSetState,
  payload: {facetId: string; numberOfValues: number}
) {
  const {facetId, numberOfValues} = payload;
  let selectedValue = state[facetId]?.request
    .values[0] as CommerceCategoryFacetValueRequest;
  if (!selectedValue) {
    return;
  }

  console.log(selectedValue.value);
  while (selectedValue.children.length && selectedValue?.state !== 'selected') {
    selectedValue = selectedValue.children[0];
    console.log(selectedValue.value);
  }
  selectedValue.retrieveCount = numberOfValues;
}
