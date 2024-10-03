import {buildMockFacetOptions} from '../../test/mock-facet-options.js';
import {buildMockSearch} from '../../test/mock-search.js';
import {logSearchEvent} from '../analytics/analytics-actions.js';
import {change} from '../history/history-actions.js';
import {getHistoryInitialState} from '../history/history-state.js';
import {executeSearch} from '../search/search-actions.js';
import {updateActiveTab} from '../tab-set/tab-set-actions.js';
import {updateFacetOptions} from './facet-options-actions.js';
import {facetOptionsReducer} from './facet-options-slice.js';
import {
  FacetOptionsState,
  getFacetOptionsInitialState,
} from './facet-options-state.js';

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

  describe('update facet enabled state on updateActiveTab', () => {
    const initialState = getFacetOptionsInitialState();
    initialState.facets = {
      notIncluded: {
        enabled: true,
        tabs: {
          included: ['tab1'],
          excluded: [],
        },
      },
      included: {
        enabled: false,
        tabs: {
          included: ['tab2'],
          excluded: [],
        },
      },
      notExcluded: {
        enabled: true,
        tabs: {
          included: [],
          excluded: ['tab1'],
        },
      },
      excluded: {
        enabled: true,
        tabs: {
          included: [],
          excluded: ['tab2'],
        },
      },
      notExcludedNotIncluded: {
        enabled: true,
        tabs: {
          included: ['tab1'],
          excluded: ['tab1'],
        },
      },
      excludedAndIncluded: {
        enabled: true,
        tabs: {
          included: ['tab2'],
          excluded: ['tab2'],
        },
      },
    };
    const action = updateActiveTab('tab2');
    const finalState = facetOptionsReducer(initialState, action);

    const testCases: [string, boolean][] = [
      ['notIncluded', false],
      ['included', true],
      ['notExcluded', true],
      ['excluded', false],
      ['notExcludedNotIncluded', false],
      ['excludedAndIncluded', false],
    ];

    test.each(testCases)(
      '%s facet should have enabled state %s',
      (facet: string, expectedEnabled: boolean) => {
        expect(finalState.facets[facet].enabled).toBe(expectedEnabled);
      }
    );
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
