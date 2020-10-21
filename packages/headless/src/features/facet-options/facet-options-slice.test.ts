import {buildMockFacetOptions} from '../../test/mock-facet-options';
import {buildMockSearch} from '../../test/mock-search';
import {logGenericSearchEvent} from '../analytics/analytics-actions';
import {change} from '../history/history-actions';
import {getHistoryEmptyState} from '../history/history-slice';
import {executeSearch} from '../search/search-actions';
import {updateFacetOptions} from './facet-options-actions';
import {
  FacetOptionsState,
  getFacetOptionsInitialState,
  facetOptionsReducer,
} from './facet-options-slice';

describe('facet options slice', () => {
  let state: FacetOptionsState;

  beforeEach(() => {
    state = getFacetOptionsInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetOptionsReducer(undefined, {type: ''});
    expect(finalState).toEqual({freezeFacetOrder: false});
  });

  describe('#updateFacetOptions', () => {
    it('dipatching an empty object does not update the options', () => {
      const finalState = facetOptionsReducer(state, updateFacetOptions({}));
      expect(finalState).toEqual(state);
    });

    it('dispatching an object with a valid key updates the option', () => {
      const finalState = facetOptionsReducer(
        state,
        updateFacetOptions({
          freezeFacetOrder: !state.freezeFacetOrder,
        })
      );

      expect(finalState.freezeFacetOrder).toBe(true);
    });
  });

  it('#executeSearch.fulfilled sets #freezeFacetOrder to false', () => {
    state.freezeFacetOrder = true;

    const search = buildMockSearch();
    state = facetOptionsReducer(
      state,
      executeSearch.fulfilled(search, '', logGenericSearchEvent({evt: ''}))
    );

    expect(state.freezeFacetOrder).toBe(false);
  });

  it('#executeSearch.rejected sets #freezeFacetOrder to false', () => {
    state.freezeFacetOrder = true;

    state = facetOptionsReducer(
      state,
      executeSearch.rejected(
        {message: '', name: ''},
        '',
        logGenericSearchEvent({evt: ''})
      )
    );

    expect(state.freezeFacetOrder).toBe(false);
  });

  it('history #change payload updates the state', () => {
    const payload = {
      ...getHistoryEmptyState(),
      facetOptions: buildMockFacetOptions({freezeFacetOrder: true}),
    };

    state = facetOptionsReducer(state, change.fulfilled(payload, ''));

    expect(state.freezeFacetOrder).toBe(true);
  });
});
