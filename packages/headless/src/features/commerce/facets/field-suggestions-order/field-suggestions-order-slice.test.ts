import {AnyAction} from '@reduxjs/toolkit';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildSearchResponse} from '../../../../test/mock-commerce-search';
import {facetOrderReducer} from '../../../facets/facet-order/facet-order-slice';
import {executeSearch} from '../../search/search-actions';
import {
  FieldSuggestionsOrderState,
  getFieldSuggestionsOrderInitialState,
} from './field-suggestions-order-state';

describe('field suggestions order slice', () => {
  let state: FieldSuggestionsOrderState;

  function dispatchMock(action: AnyAction) {
    state = facetOrderReducer(state, action);
  }

  beforeEach(() => {
    state = getFieldSuggestionsOrderInitialState();
  });

  it('initializes the state correctly', () => {
    expect(facetOrderReducer(undefined, {type: ''})).toEqual([]);
  });

  function buildQueryAction(facetIds: string[]) {
    const facetValue = buildMockCommerceRegularFacetValue({
      value: 'some-value',
    });
    const response = buildSearchResponse();
    response.response.facets = facetIds.map((facetId) =>
      buildMockCommerceRegularFacetResponse({
        facetId,
        values: [facetValue],
      })
    );

    return executeSearch.fulfilled(response, '');
  }
  it('saves the facet order when a query is successful', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMock(buildQueryAction(facetIds));
    expect(state).toEqual(facetIds);
  });
});
