import {AnyAction} from 'redux';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockSearch} from '../../../test/mock-search';
import {buildMockSearchResponse} from '../../../test/mock-search-response';
import {change} from '../../history/history-actions';
import {getHistoryInitialState} from '../../history/history-state';
import {executeSearch} from '../../search/search-actions';
import {facetOrderReducer} from './facet-order-slice';
import {FacetOrderState, getFacetOrderInitialState} from './facet-order-state';

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
