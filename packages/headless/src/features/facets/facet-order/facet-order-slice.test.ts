import {AnyAction} from '@reduxjs/toolkit';
import {buildMockFacetResponse} from '../../../test/mock-facet-response.js';
import {buildMockSearch} from '../../../test/mock-search.js';
import {buildMockSearchResponse} from '../../../test/mock-search-response.js';
import {change} from '../../history/history-actions.js';
import {getHistoryInitialState} from '../../history/history-state.js';
import {executeSearch} from '../../search/search-actions.js';
import {facetOrderReducer} from './facet-order-slice.js';
import {FacetOrderState, getFacetOrderInitialState} from './facet-order-state.js';

describe('facet-order slice', () => {
  let state: FacetOrderState;

  function dispatchMock(action: AnyAction) {
    state = facetOrderReducer(state, action);
  }

  function dispatchMockSearch(facetIds: string[]) {
    dispatchMock(
      executeSearch.fulfilled(
        buildMockSearch({
          response: buildMockSearchResponse({
            facets: facetIds.map((facetId) =>
              buildMockFacetResponse({facetId})
            ),
          }),
        }),
        '',
        null as never
      )
    );
  }

  function dispatchMockHistoryChange(facetIds: string[]) {
    dispatchMock(
      change.fulfilled(
        {...getHistoryInitialState(), facetOrder: facetIds},
        '',
        null as never
      )
    );
  }

  beforeEach(() => {
    state = getFacetOrderInitialState();
  });

  it('initializes the state correctly', () => {
    expect(facetOrderReducer(undefined, {type: ''})).toEqual([]);
  });

  it('saves the facet order when a search is successful', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMockSearch(facetIds);
    expect(state).toEqual(facetIds);
  });

  it('restores the facet order when moving through the history', () => {
    const facetIds = ['facetA', 'facetB'];
    dispatchMockHistoryChange(facetIds);
    expect(state).toEqual(facetIds);
  });
});
