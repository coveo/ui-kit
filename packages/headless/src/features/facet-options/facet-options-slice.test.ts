import {buildMockFacetOptions} from '../../test/mock-facet-options';
import {buildMockSearch} from '../../test/mock-search';
import {logSearchEvent} from '../analytics/analytics-actions';
import {change} from '../history/history-actions';
import {getHistoryInitialState} from '../history/history-state';
import {executeSearch} from '../search/search-actions';
import {updateActiveTab} from '../tab-set/tab-set-actions';
import {updateFacetOptions} from './facet-options-actions';
import {facetOptionsReducer} from './facet-options-slice';
import {
  FacetOptionsState,
  getFacetOptionsInitialState,
} from './facet-options-state';

describe('facet options slice', () => {
  let state: FacetOptionsState;

  beforeEach(() => {
    state = getFacetOptionsInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetOptionsReducer(undefined, {type: ''});
    expect(finalState).toEqual({facets: {}, freezeFacetOrder: false});
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

  it('should update facet enabled state on updateActiveTab', () => {
    const initialState = getFacetOptionsInitialState();
    initialState.facets = {
      facetNotIncluded: {
        enabled: true,
        tabs: {
          included: ['tab1'],
          excluded: [],
        },
      },
      facetIncluded: {
        enabled: false,
        tabs: {
          included: ['tab2'],
          excluded: [],
        },
      },
      facetNotExcluded: {
        enabled: true,
        tabs: {
          included: [],
          excluded: ['tab1'],
        },
      },
      facetExcluded: {
        enabled: true,
        tabs: {
          included: [],
          excluded: ['tab2'],
        },
      },
      facetNotExcludedNotIncluded: {
        enabled: true,
        tabs: {
          included: ['tab1'],
          excluded: ['tab1'],
        },
      },
      facetExcludedAndIncluded: {
        enabled: true,
        tabs: {
          included: ['tab2'],
          excluded: ['tab2'],
        },
      },
    };
    const action = updateActiveTab('tab2');
    const finalState = facetOptionsReducer(initialState, action);
    expect(finalState.facets.facetNotIncluded.enabled).toBe(false);
    expect(finalState.facets.facetIncluded.enabled).toBe(true);
    expect(finalState.facets.facetNotExcluded.enabled).toBe(true);
    expect(finalState.facets.facetExcluded.enabled).toBe(false);
    expect(finalState.facets.facetNotExcludedNotIncluded.enabled).toBe(false);
    expect(finalState.facets.facetExcludedAndIncluded.enabled).toBe(false);
  });

  it('#executeSearch.fulfilled sets #freezeFacetOrder to false', () => {
    state.freezeFacetOrder = true;

    const search = buildMockSearch();
    state = facetOptionsReducer(
      state,
      executeSearch.fulfilled(search, '', {legacy: logSearchEvent({evt: ''})})
    );

    expect(state.freezeFacetOrder).toBe(false);
  });

  it('#executeSearch.rejected sets #freezeFacetOrder to false', () => {
    state.freezeFacetOrder = true;

    state = facetOptionsReducer(
      state,
      executeSearch.rejected({message: '', name: ''}, '', {
        legacy: logSearchEvent({evt: ''}),
      })
    );

    expect(state.freezeFacetOrder).toBe(false);
  });

  it('history #change payload updates the state', () => {
    const payload = {
      ...getHistoryInitialState(),
      facetOptions: buildMockFacetOptions({freezeFacetOrder: true}),
    };

    state = facetOptionsReducer(state, change.fulfilled(payload, ''));

    expect(state.freezeFacetOrder).toBe(true);
  });
});
