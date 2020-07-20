import {BaseFacetSearchRequest, Type} from '../api/request';
import {SearchPageState} from '../../../../state';
import {searchRequestParams} from '../../search/search-request';

export interface FacetSearchRequest
  extends BaseFacetSearchRequest,
    Type<'specific'> {}

export const facetSearchRequestParams = (
  id: string,
  state: SearchPageState
): FacetSearchRequest => {
  const {captions, numberOfValues, query} = state.facetSearchSet[id].options;
  const {field, delimitingCharacter, currentValues} = state.facetSet[id];
  const searchContext = searchRequestParams(state);
  const ignoreValues = currentValues
    .filter((v) => v.state !== 'idle')
    .map((facetValue) => facetValue.value);

  return {
    captions,
    numberOfValues,
    query,
    field,
    delimitingCharacter,
    ignoreValues,
    searchContext,
    type: 'specific',
  };
};
