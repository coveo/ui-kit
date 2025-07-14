import type {ActionCreatorWithoutPayload} from '@reduxjs/toolkit';
import type {FacetValueState} from '../../facets/facet-api/value.js';
import {selectCategoryFacetSearchResult} from '../../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {setView} from '../context/context-actions.js';
import {toggleSelectCategoryFacetValue} from '../facets/category-facet/category-facet-actions.js';
import {
  clearAllCoreFacets,
  deleteAllCoreFacets,
  deselectAllValuesInCoreFacet,
} from '../facets/core-facet/core-facet-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../facets/date-facet/date-facet-actions.js';
import {toggleSelectLocationFacetValue} from '../facets/location-facet/location-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
} from '../facets/numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../facets/regular-facet/regular-facet-actions.js';
import {
  nextPage,
  previousPage,
  selectPage,
  setPageSize,
} from '../pagination/pagination-actions.js';
import {
  type ProductListingParameters,
  restoreProductListingParameters,
} from '../product-listing-parameters/product-listing-parameters-actions.js';
import {updateQuery} from '../query/query-actions.js';
import type {CommerceSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {SortBy, SortDirection} from '../sort/sort.js';
import {applySort} from '../sort/sort-actions.js';
import {parametersReducer} from './parameters-slice.js';
import {
  type CommerceParametersState,
  getCommerceParametersInitialState,
} from './parameters-state.js';

describe('commerceParameters slice', () => {
  let initialState: CommerceParametersState;

  beforeEach(() => {
    initialState = getCommerceParametersInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = parametersReducer(undefined, {type: ''});
    expect(finalState).toEqual(initialState);
  });

  describe('when #nextPage is dispatched', () => {
    it('when payload.slotId is defined, does not modify state', () => {
      const state = {
        ...initialState,
        page: 1,
      };
      const finalState = parametersReducer(state, nextPage({slotId: 'slotId'}));
      expect(finalState).toEqual(state);
    });

    describe('when payload.slotId is undefined', () => {
      it('when state.page is defined, increments state.page', () => {
        const state = {
          ...initialState,
          page: 1,
        };
        const finalState = parametersReducer(state, nextPage());
        expect(finalState).toEqual({...state, page: 2});
      });

      it('when state.page is undefined, sets state.page to 1', () => {
        const finalState = parametersReducer(initialState, nextPage());
        expect(finalState).toEqual({...initialState, page: 1});
      });
    });
  });

  describe('when #previousPage is dispatched', () => {
    it('when payload.slotId is defined, does not modify state', () => {
      const state = {
        ...initialState,
        page: 2,
      };
      const finalState = parametersReducer(
        state,
        previousPage({slotId: 'slotId'})
      );
      expect(finalState).toEqual(state);
    });

    describe('when payload.slotId is undefined', () => {
      it('when state.page is greater than 1, decrements state.page', () => {
        const state = {
          ...initialState,
          page: 2,
        };
        const finalState = parametersReducer(state, previousPage());
        expect(finalState).toEqual({...state, page: 1});
      });

      it('when state.page is 1, sets state.page to undefined', () => {
        const state = {
          ...initialState,
          page: 1,
        };
        const finalState = parametersReducer(state, previousPage());
        expect(finalState).toEqual({...state, page: undefined});
      });

      it('when state.page is 0, sets state.page to undefined', () => {
        const state = {
          ...initialState,
          page: 0,
        };
        const finalState = parametersReducer(state, previousPage());
        expect(finalState).toEqual({...state, page: undefined});
      });

      it('when state.page is undefined, set state.page to undefined', () => {
        const finalState = parametersReducer(initialState, previousPage());
        expect(finalState).toEqual({...initialState, page: undefined});
      });
    });
  });

  describe('when #selectPage is dispatched', () => {
    it('when payload.slotId is defined, does not modify state', () => {
      const state = {
        ...initialState,
        page: 1,
      };
      const finalState = parametersReducer(
        state,
        selectPage({slotId: 'slotId', page: 5})
      );
      expect(finalState).toEqual(state);
    });

    describe('when payload.slotId is not defined', () => {
      it('when state.page is greater than 0, sets state.page to payload.page', () => {
        const state = {
          ...initialState,
          page: 1,
        };
        const finalState = parametersReducer(state, selectPage({page: 5}));
        expect(finalState).toEqual({...state, page: 5});
      });

      it('when state.page is not greater than 0, sets state.page to undefined', () => {
        const state = {
          ...initialState,
          page: 1,
        };
        const finalState = parametersReducer(state, selectPage({page: 0}));
        expect(finalState).toEqual({...state, page: undefined});
      });
    });
  });

  describe('when setPageSize is dispatched', () => {
    it('when payload.slotId is defined, does not modify state', () => {
      const state = {
        ...initialState,
        page: 5,
        perPage: 5,
      };
      const finalState = parametersReducer(
        state,
        setPageSize({slotId: 'slotId', pageSize: 20})
      );
      expect(finalState).toEqual(state);
    });

    describe('when payload.slotId is not defined', () => {
      it('sets state.page to undefined', () => {
        const state = {
          ...initialState,
          page: 5,
          perPage: 5,
        };
        const finalState = parametersReducer(state, setPageSize({pageSize: 5}));
        expect(finalState).toEqual({...state, page: undefined});
      });

      it('when payload.pageSize is 0, set state.perPage to undefined', () => {
        const state = {
          ...initialState,
          perPage: 5,
        };
        const finalState = parametersReducer(state, setPageSize({pageSize: 0}));
        expect(finalState).toEqual({...state, perPage: undefined});
      });

      it('when payload.pageSize is greater than 0, sets state.perPage to payload.pageSize', () => {
        const state = {
          ...initialState,
          perPage: 5,
        };
        const finalState = parametersReducer(
          state,
          setPageSize({pageSize: 20})
        );
        expect(finalState).toEqual({...initialState, perPage: 20});
      });
    });
  });

  describe('when #applySort is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        applySort({by: SortBy.Relevance})
      );
      expect(finalState.page).toBeUndefined();
    });
    it('sets state.sortCriteria to payload', () => {
      const newSort = {
        by: SortBy.Fields,
        fields: [
          {
            name: 'price',
            direction: SortDirection.Ascending,
            displayName: 'Price (lowest to highest)',
          },
        ],
      };
      const finalState = parametersReducer(
        {...initialState, sortCriteria: {by: SortBy.Relevance}},
        applySort(newSort)
      );
      expect(finalState).toEqual({...initialState, sortCriteria: newSort});
    });
  });
  describe('when #updateQuery is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        updateQuery({query: 'new query'})
      );
      expect(finalState.page).toBeUndefined();
    });
    it('when payload.query is undefined, set state.q to undefined', () => {
      const state = {
        ...initialState,
        q: 'query',
      };
      const finalState = parametersReducer(
        state,
        updateQuery({query: undefined})
      );
      expect(finalState).toEqual({...state, q: undefined});
    });

    it('when payload.query is an empty string, set state.q to undefined', () => {
      const state = {
        ...initialState,
        q: 'query',
      };
      const finalState = parametersReducer(state, updateQuery({query: ''}));
      expect(finalState).toEqual({...state, q: undefined});
    });

    it('when the trimmed payload.query is an empty string, set state.q to undefined', () => {
      const state = {
        ...initialState,
        q: 'query',
      };
      const finalState = parametersReducer(
        state,
        updateQuery({query: '          '})
      );
      expect(finalState).toEqual({...state, q: undefined});
    });

    it('when payload.query is not undefined, blank, or empty, set state.q to payload.query', () => {
      const state = {...initialState, q: 'query'};
      const finalState = parametersReducer(
        state,
        updateQuery({query: 'new query'})
      );
      expect(finalState).toEqual({...state, q: 'new query'});
    });
  });

  describe.each<{action: ActionCreatorWithoutPayload; actionName: string}>([
    {action: clearAllCoreFacets, actionName: 'clearAllCoreFacets'},
    {action: deleteAllCoreFacets, actionName: 'deleteAllCoreFacets'},
  ])('when $actionName is dispatched', ({action}) => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(state, action());
      expect(finalState.page).toBeUndefined();
    });

    it('sets cf, df, dfExcluded, lf, mnf, mnfExcluded, nf, nfExcluded, f, and fExcluded to undefined in state', () => {
      const finalState = parametersReducer(
        {
          ...initialState,
          cf: {facetId1: ['value']},
          df: {
            facetId2: [
              {
                start: '2025-01-01',
                end: '2026-12-31',
                endInclusive: true,
                state: 'selected',
              },
            ],
          },
          dfExcluded: {
            facetId2: [
              {
                start: '2026-01-01',
                end: '2027-12-31',
                endInclusive: true,
                state: 'selected',
              },
            ],
          },
          lf: {facetId3: ['value']},
          mnf: {
            facetId4: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
          mnfExcluded: {
            facetId4: [
              {start: 100, end: 200, endInclusive: true, state: 'selected'},
            ],
          },
          nf: {
            facetId5: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
          nfExcluded: {
            facetId5: [
              {start: 100, end: 200, endInclusive: true, state: 'selected'},
            ],
          },
          f: {facetId6: ['value']},
          fExcluded: {facetId7: ['value']},
        },
        action()
      );
      expect(finalState).toEqual(initialState);
    });
  });

  describe('when #deselectAllValuesInCoreFacet is dispatched', () => {
    let state: CommerceParametersState;
    beforeEach(() => {
      state = {
        ...initialState,
        cf: {facetId1: ['value1']},
        df: {
          facetId1: [
            {
              start: '2025-01-01',
              end: '2026-12-31',
              endInclusive: true,
              state: 'selected',
            },
          ],
        },
        dfExcluded: {
          facetId1: [
            {
              start: '2026-01-01',
              end: '2027-12-31',
              endInclusive: true,
              state: 'excluded',
            },
          ],
        },
        lf: {facetId1: ['value1']},
        mnf: {
          facetId1: [
            {start: 0, end: 100, endInclusive: true, state: 'selected'},
          ],
        },
        mnfExcluded: {
          facetId1: [
            {start: 100, end: 200, endInclusive: true, state: 'excluded'},
          ],
        },
        nf: {
          facetId1: [
            {start: 0, end: 100, endInclusive: true, state: 'selected'},
          ],
        },
        nfExcluded: {
          facetId1: [
            {start: 100, end: 200, endInclusive: true, state: 'excluded'},
          ],
        },
        f: {facetId1: ['value1']},
        fExcluded: {facetId1: ['value1']},
      };
    });

    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        deselectAllValuesInCoreFacet({facetId: 'facetId1'})
      );
      expect(finalState.page).toBeUndefined();
    });

    it('deletes the corresponding record in each facet property of the state', () => {
      const finalState = parametersReducer(
        {
          ...state,
          cf: {...state.cf, facetId2: ['value2']},
          df: {
            ...state.df,
            facetId2: [
              {
                start: '2025-01-01',
                end: '2026-12-31',
                endInclusive: true,
                state: 'selected',
              },
            ],
          },
          dfExcluded: {
            ...state.dfExcluded,
            facetId2: [
              {
                start: '2026-01-01',
                end: '2027-12-31',
                endInclusive: true,
                state: 'excluded',
              },
            ],
          },
          lf: {...state.lf, facetId2: ['value2']},
          mnf: {
            ...state.mnf,
            facetId2: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
          mnfExcluded: {
            ...state.mnfExcluded,
            facetId2: [
              {start: 100, end: 200, endInclusive: true, state: 'excluded'},
            ],
          },
          nf: {
            ...state.nf,
            facetId2: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
          nfExcluded: {
            ...state.nfExcluded,
            facetId2: [
              {start: 100, end: 200, endInclusive: true, state: 'excluded'},
            ],
          },
          f: {...state.f, facetId2: ['value2']},
          fExcluded: {...state.fExcluded, facetId2: ['value2']},
        },
        deselectAllValuesInCoreFacet({facetId: 'facetId2'})
      );

      expect(finalState).toEqual(state);
    });

    it('when a facet property of the has no keys, deletes that facet property', () => {
      const finalState = parametersReducer(
        state,
        deselectAllValuesInCoreFacet({facetId: 'facetId1'})
      );
      expect(finalState).toEqual(initialState);
    });
  });

  describe('when #toggleSelectCategoryFacetValue is dispatched', () => {
    let state: CommerceParametersState;

    beforeEach(() => {
      state = {
        ...initialState,
        cf: {facetId1: ['f1v1']},
      };
    });

    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleSelectCategoryFacetValue({
          facetId: 'facetId2',
          selection: {
            children: [],
            isLeafValue: true,
            value: 'f2v2',
            state: 'selected',
            moreValuesAvailable: false,
            numberOfResults: 1,
            path: ['f2v1', 'f2v2'],
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "selected"', () => {
      it('deletes state.cf[payload.facetId]', () => {
        const finalState = parametersReducer(
          {
            ...state,
            cf: {...state.cf, facetId2: ['f2v1', 'f2v2']},
          },
          toggleSelectCategoryFacetValue({
            facetId: 'facetId2',
            selection: {
              children: [],
              isLeafValue: true,
              value: 'f2v2',
              state: 'selected',
              moreValuesAvailable: false,
              numberOfResults: 1,
              path: ['f2v1', 'f2v2'],
            },
          })
        );
        expect(finalState).toEqual(state);
      });
      it('when state.cf has no keys, sets state.cf to undefined', () => {
        const finalState = parametersReducer(
          state,
          toggleSelectCategoryFacetValue({
            facetId: 'facetId1',
            selection: {
              children: [],
              isLeafValue: true,
              value: 'f1v1',
              state: 'selected',
              moreValuesAvailable: false,
              numberOfResults: 1,
              path: ['f1v1'],
            },
          })
        );

        expect(finalState).toEqual({...state, cf: undefined});
      });
    });

    it('when payload.selection.state is "idle", sets state.cf[payload.facetId] to payload.selection.path', () => {
      const finalState = parametersReducer(
        state,
        toggleSelectCategoryFacetValue({
          facetId: 'facetId1',
          selection: {
            children: [],
            isLeafValue: true,
            value: 'f1v3',
            state: 'idle',
            moreValuesAvailable: false,
            numberOfResults: 1,
            path: ['f1v1', 'f1v2', 'f1v3'],
          },
        })
      );

      expect(finalState).toEqual({
        ...state,
        cf: {facetId1: ['f1v1', 'f1v2', 'f1v3']},
      });
    });
  });

  describe('when #selectCategoryFacetSearchResult is dispatched', () => {
    let state: CommerceParametersState;

    beforeEach(() => {
      state = {
        ...initialState,
        cf: {facetId1: ['f1v1']},
      };
    });

    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        selectCategoryFacetSearchResult({
          facetId: 'facetId2',
          value: {
            path: ['f2v1', 'f2v2'],
            count: 1,
            displayValue: 'f2v2',
            rawValue: 'f2v2',
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });
    it('sets state.cf[payload.facetId] to [...payload.value.path, payload.value.rawValue]', () => {
      const finalState = parametersReducer(
        state,
        selectCategoryFacetSearchResult({
          facetId: 'facetId2',
          value: {
            path: ['f2v1', 'f2v2'],
            count: 1,
            displayValue: 'F2V3',
            rawValue: 'f2v3',
          },
        })
      );

      expect(finalState).toEqual({
        ...state,
        cf: {facetId1: ['f1v1'], facetId2: ['f2v1', 'f2v2', 'f2v3']},
      });
    });
  });

  const testUnsetValueAfterRegularFacetToggle = (
    stateKey: keyof CommerceParametersState,
    payloadValueState: FacetValueState,
    action:
      | typeof toggleSelectFacetValue
      | typeof toggleExcludeFacetValue
      | typeof toggleSelectLocationFacetValue
  ) => {
    describe(`when state.${stateKey}[payload.facetId] is defined`, () => {
      let state: CommerceParametersState;
      beforeEach(() => {
        state = {
          ...initialState,
          [stateKey]: {
            facetId1: ['f1v1'],
            facetId2: ['f2v1', 'f2v2'],
          },
        };
      });

      it(`deletes payload.selection from state.${stateKey}[payload.facetId]`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              value: 'f2v1',
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual({
          facetId1: ['f1v1'],
          facetId2: ['f2v2'],
        });
      });
      it(`when state.${stateKey}[payload.facetId] is empty, sets state.${stateKey}[payload.facetId] to undefined`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            selection: {
              value: 'f1v1',
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual({facetId2: ['f2v1', 'f2v2']});
      });
      it(`when state.${stateKey} has no keys, sets state.${stateKey} to undefined`, () => {
        state = {
          ...state,
          [stateKey]: {facetId1: ['f1v1']},
        };

        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            selection: {
              value: 'f1v1',
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toBeUndefined();
      });
    });
  };

  describe('when #toggleSelectFacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleSelectFacetValue({
          facetId: 'facetId',
          selection: {
            value: 'value',
            state: 'selected',
            numberOfResults: 1,
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "selected"', () => {
      testUnsetValueAfterRegularFacetToggle(
        'fExcluded',
        'selected',
        toggleSelectFacetValue
      );
      testUnsetValueAfterRegularFacetToggle(
        'f',
        'selected',
        toggleSelectFacetValue
      );
    });

    describe.each<{payloadValueState: FacetValueState}>([
      {payloadValueState: 'excluded'},
      {payloadValueState: 'idle'},
    ])(
      'when payload.selection.state is $payloadValueState',
      ({payloadValueState}) => {
        testUnsetValueAfterRegularFacetToggle(
          'fExcluded',
          payloadValueState,
          toggleSelectFacetValue
        );

        it('when state.f[payload.facetId] is undefined, creates it and pushes payload.selection.value to it', () => {
          const finalState = parametersReducer(
            initialState,
            toggleSelectFacetValue({
              facetId: 'facetId',
              selection: {
                value: 'value',
                state: payloadValueState,
                numberOfResults: 1,
              },
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            f: {facetId: ['value']},
          });
        });
        it('when state.f[payload.facetId] is defined, appends payload.selection.value to it', () => {
          const finalState = parametersReducer(
            {...initialState, f: {facetId: ['value1']}},
            toggleSelectFacetValue({
              facetId: 'facetId',
              selection: {
                value: 'value2',
                state: payloadValueState,
                numberOfResults: 1,
              },
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            f: {facetId: ['value1', 'value2']},
          });
        });
      }
    );
  });

  describe('when #toggleExcludeFacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleExcludeFacetValue({
          facetId: 'facetId',
          selection: {
            value: 'value',
            state: 'excluded',
            numberOfResults: 1,
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "excluded"', () => {
      testUnsetValueAfterRegularFacetToggle(
        'f',
        'excluded',
        toggleExcludeFacetValue
      );
      testUnsetValueAfterRegularFacetToggle(
        'fExcluded',
        'excluded',
        toggleExcludeFacetValue
      );
    });

    describe.each<{payloadValueState: FacetValueState}>([
      {payloadValueState: 'selected'},
      {payloadValueState: 'idle'},
    ])(
      'when payload.selection.state is $payloadValueState',
      ({payloadValueState}) => {
        testUnsetValueAfterRegularFacetToggle(
          'f',
          payloadValueState,
          toggleExcludeFacetValue
        );

        it('when state.fExcluded[payload.facetId] is undefined, creates it and pushes payload.selection.value to it', () => {
          const finalState = parametersReducer(
            initialState,
            toggleExcludeFacetValue({
              facetId: 'facetId',
              selection: {
                value: 'value',
                state: payloadValueState,
                numberOfResults: 1,
              },
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            fExcluded: {facetId: ['value']},
          });
        });
        it('when state.fExcluded[payload.facetId] is defined, appends payload.selection.value to it', () => {
          const finalState = parametersReducer(
            {...initialState, fExcluded: {facetId: ['value1']}},
            toggleExcludeFacetValue({
              facetId: 'facetId',
              selection: {
                value: 'value2',
                state: payloadValueState,
                numberOfResults: 1,
              },
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            fExcluded: {facetId: ['value1', 'value2']},
          });
        });
      }
    );
  });

  const testUnsetValueAfterFacetSearch = (
    key: 'f' | 'fExcluded',
    action: typeof selectFacetSearchResult | typeof excludeFacetSearchResult
  ) => {
    describe(`when state.${key}[payload.facetId] is defined`, () => {
      let state: CommerceParametersState;
      beforeEach(() => {
        state = {
          ...initialState,
          [key]: {
            facetId1: ['f1v1raw'],
            facetId2: ['f2v1raw', 'f2v2raw'],
          },
        };
      });

      it(`deletes payload.value.rawValue from state.${key}[payload.facetId]`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            value: {
              count: 1,
              displayValue: 'f2v2',
              rawValue: 'f2v2raw',
            },
          })
        );
        expect(finalState[key]).toEqual({
          facetId1: ['f1v1raw'],
          facetId2: ['f2v1raw'],
        });
      });

      it(`when state.${key}[payload.facetId] is empty, sets state.${key}[payload.facetId] to undefined`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            value: {
              count: 1,
              displayValue: 'f1v1',
              rawValue: 'f1v1raw',
            },
          })
        );
        expect(finalState[key]).toEqual({facetId2: ['f2v1raw', 'f2v2raw']});
      });

      it(`when state.${key} has no keys, sets state.${key} to undefined`, () => {
        state = {
          ...state,
          [key]: {facetId1: ['f1v1raw']},
        };

        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            value: {
              count: 1,
              displayValue: 'f1v1',
              rawValue: 'f1v1raw',
            },
          })
        );
        expect(finalState[key]).toBeUndefined();
      });
    });
  };

  describe('when #selectFacetSearchResult is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        selectFacetSearchResult({
          facetId: 'facetId',
          value: {
            count: 1,
            displayValue: 'displayValue2',
            rawValue: 'rawValue2',
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });
    testUnsetValueAfterFacetSearch('fExcluded', selectFacetSearchResult);
    it('appends payload.value.rawValue to state.f[payload.facetId]', () => {
      const state = {
        ...initialState,
        f: {
          facetId: ['rawValue1'],
        },
      };

      const finalState = parametersReducer(
        state,
        selectFacetSearchResult({
          facetId: 'facetId',
          value: {
            count: 1,
            displayValue: 'displayValue2',
            rawValue: 'rawValue2',
          },
        })
      );
      expect(finalState.f).toEqual({facetId: ['rawValue1', 'rawValue2']});
    });
  });

  describe('when #excludeFacetSearchResult is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        excludeFacetSearchResult({
          facetId: 'facetId',
          value: {
            count: 1,
            displayValue: 'displayValue2',
            rawValue: 'rawValue2',
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });
    testUnsetValueAfterFacetSearch('f', excludeFacetSearchResult);
    it('appends payload.value.rawValue to state.fExcluded[payload.facetId]', () => {
      const state = {
        ...initialState,
        fExcluded: {
          facetId: ['rawValue1'],
        },
      };

      const finalState = parametersReducer(
        state,
        excludeFacetSearchResult({
          facetId: 'facetId',
          value: {
            count: 1,
            displayValue: 'displayValue2',
            rawValue: 'rawValue2',
          },
        })
      );
      expect(finalState.fExcluded).toEqual({
        facetId: ['rawValue1', 'rawValue2'],
      });
    });
  });

  const testUnsetValueAfterNumericRangeToggle = (
    stateKey: keyof CommerceParametersState,
    payloadValueState: FacetValueState,
    action:
      | typeof toggleSelectNumericFacetValue
      | typeof toggleExcludeNumericFacetValue
  ) => {
    describe(`when state.${stateKey}[payload.facetId] is defined`, () => {
      let state: CommerceParametersState;
      beforeEach(() => {
        state = {
          ...initialState,
          [stateKey]: {
            facetId1: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
            facetId2: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
              {start: 100, end: 200, endInclusive: true, state: 'selected'},
            ],
          },
        };
      });
      it(`deletes item matching payload's start, end, and endInclusive values from state.${stateKey}[payload.facetId]`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: 0,
              end: 100,
              endInclusive: true,
              state: payloadValueState,
            },
          })
        );
        expect(finalState[stateKey]).toEqual({
          facetId1: [
            {start: 0, end: 100, endInclusive: true, state: 'selected'},
          ],
          facetId2: [
            {start: 100, end: 200, endInclusive: true, state: 'selected'},
          ],
        });
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's endInclusive value`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: 0,
              end: 100,
              endInclusive: false,
              state: payloadValueState,
            },
          })
        );
        expect(finalState[stateKey]).toEqual(state[stateKey]);
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's start value`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: 1,
              end: 100,
              endInclusive: true,
              state: payloadValueState,
            },
          })
        );
        expect(finalState[stateKey]).toEqual(state[stateKey]);
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's end value`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: 0,
              end: 99,
              endInclusive: true,
              state: payloadValueState,
            },
          })
        );
        expect(finalState[stateKey]).toEqual(state[stateKey]);
      });

      it(`when state.${stateKey}[payload.facetId] is empty, sets state.${stateKey}[payload.facetId] to undefined`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            selection: {
              start: 0,
              end: 100,
              endInclusive: true,
              state: payloadValueState,
            },
          })
        );
        expect(finalState[stateKey]).toEqual({
          facetId1: undefined,
          facetId2: [
            {start: 0, end: 100, endInclusive: true, state: 'selected'},
            {start: 100, end: 200, endInclusive: true, state: 'selected'},
          ],
        });
      });
      it(`when state.${stateKey} has no keys, sets state.${stateKey} to undefined`, () => {
        state = {
          ...state,
          [stateKey]: {
            facetId1: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
        };

        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            selection: {
              start: 0,
              end: 100,
              endInclusive: true,
              state: payloadValueState,
            },
          })
        );
        expect(finalState[stateKey]).toBeUndefined();
      });
    });
  };

  describe('when #toggleSelectNumericfacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleSelectNumericFacetValue({
          facetId: 'facetId',
          selection: {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'selected',
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "selected"', () => {
      testUnsetValueAfterNumericRangeToggle(
        'mnf',
        'selected',
        toggleSelectNumericFacetValue
      );
      testUnsetValueAfterNumericRangeToggle(
        'mnfExcluded',
        'selected',
        toggleSelectNumericFacetValue
      );
      testUnsetValueAfterNumericRangeToggle(
        'nfExcluded',
        'selected',
        toggleSelectNumericFacetValue
      );
      testUnsetValueAfterNumericRangeToggle(
        'nf',
        'selected',
        toggleSelectNumericFacetValue
      );
    });

    describe.each([
      {payloadValueState: 'excluded' as FacetValueState},
      {payloadValueState: 'idle' as FacetValueState},
    ])(
      'when payload.selection.state is "$payloadValueState"',
      ({payloadValueState}) => {
        testUnsetValueAfterNumericRangeToggle(
          'mnf',
          payloadValueState,
          toggleSelectNumericFacetValue
        );
        testUnsetValueAfterNumericRangeToggle(
          'mnfExcluded',
          payloadValueState,
          toggleSelectNumericFacetValue
        );
        testUnsetValueAfterNumericRangeToggle(
          'nfExcluded',
          payloadValueState,
          toggleSelectNumericFacetValue
        );
        it('when state.nf[payload.facetId] is undefined, creates it and pushes payload.selection.value to it', () => {
          const value = {
            start: 0,
            end: 100,
            endInclusive: true,
            state: payloadValueState,
          };

          const finalState = parametersReducer(
            initialState,
            toggleSelectNumericFacetValue({
              facetId: 'facetId',
              selection: value,
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            nf: {facetId: [value]},
          });
        });
        it('when state.nf[payload.facetId] is defined, appends payload.selection.value to it', () => {
          const state: CommerceParametersState = {
            ...initialState,
            nf: {
              facetId: [
                {start: 0, end: 100, endInclusive: true, state: 'selected'},
              ],
            },
          };
          const finalState = parametersReducer(
            state,
            toggleSelectNumericFacetValue({
              facetId: 'facetId',
              selection: {
                start: 100,
                end: 200,
                endInclusive: true,
                state: payloadValueState,
              },
            })
          );
          expect(finalState).toEqual({
            ...state,
            nf: {
              facetId: [
                ...state.nf!.facetId,
                {
                  start: 100,
                  end: 200,
                  endInclusive: true,
                  state: payloadValueState,
                },
              ],
            },
          });
        });
      }
    );
  });

  describe('when #toggleExcludeNumericFacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleExcludeNumericFacetValue({
          facetId: 'facetId',
          selection: {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'selected',
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "excluded"', () => {
      testUnsetValueAfterNumericRangeToggle(
        'mnf',
        'excluded',
        toggleExcludeNumericFacetValue
      );
      testUnsetValueAfterNumericRangeToggle(
        'mnfExcluded',
        'excluded',
        toggleExcludeNumericFacetValue
      );
      testUnsetValueAfterNumericRangeToggle(
        'nf',
        'excluded',
        toggleExcludeNumericFacetValue
      );
      testUnsetValueAfterNumericRangeToggle(
        'nfExcluded',
        'excluded',
        toggleExcludeNumericFacetValue
      );
    });

    describe.each([
      {payloadValueState: 'selected' as FacetValueState},
      {payloadValueState: 'idle' as FacetValueState},
    ])(
      'when payload.selection.state is "$payloadValueState"',
      ({payloadValueState}) => {
        testUnsetValueAfterNumericRangeToggle(
          'mnf',
          payloadValueState,
          toggleExcludeNumericFacetValue
        );
        testUnsetValueAfterNumericRangeToggle(
          'mnfExcluded',
          payloadValueState,
          toggleExcludeNumericFacetValue
        );
        testUnsetValueAfterNumericRangeToggle(
          'nf',
          payloadValueState,
          toggleExcludeNumericFacetValue
        );
        it('when state.nfExcluded[payload.facetId] is undefined, creates it and pushes payload.selection.value to it', () => {
          const value = {
            start: 0,
            end: 100,
            endInclusive: true,
            state: payloadValueState,
          };

          const finalState = parametersReducer(
            initialState,
            toggleExcludeNumericFacetValue({
              facetId: 'facetId',
              selection: value,
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            nfExcluded: {facetId: [value]},
          });
        });
        it('when state.nfExcluded[payload.facetId] is defined, appends payload.selection.value to it', () => {
          const state: CommerceParametersState = {
            ...initialState,
            nfExcluded: {
              facetId: [
                {start: 0, end: 100, endInclusive: true, state: 'excluded'},
              ],
            },
          };
          const finalState = parametersReducer(
            state,
            toggleExcludeNumericFacetValue({
              facetId: 'facetId',
              selection: {
                start: 100,
                end: 200,
                endInclusive: true,
                state: payloadValueState,
              },
            })
          );
          expect(finalState).toEqual({
            ...state,
            nfExcluded: {
              facetId: [
                ...state.nfExcluded!.facetId,
                {
                  start: 100,
                  end: 200,
                  endInclusive: true,
                  state: payloadValueState,
                },
              ],
            },
          });
        });
      }
    );
  });

  const testUnsetValueAfterManualNumericRangeUpdate = (
    stateKey: keyof CommerceParametersState
  ) => {
    describe(`when state.${stateKey} is defined`, () => {
      let state: CommerceParametersState;
      beforeEach(() => {
        state = {
          ...initialState,
          [stateKey]: {
            facetId1: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
            facetId2: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
              {start: 100, end: 200, endInclusive: true, state: 'selected'},
            ],
          },
        };
      });
      it(`deletes item matching payload's start, end, and endInclusive values from state.${stateKey}[payload.facetId]`, () => {
        const finalState = parametersReducer(
          state,
          updateManualNumericFacetRange({
            facetId: 'facetId2',
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'idle',
          })
        );
        expect(finalState).toEqual({
          ...state,
          [stateKey]: {
            facetId1: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
            facetId2: [
              {start: 100, end: 200, endInclusive: true, state: 'selected'},
            ],
          },
        });
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's endInclusive value`, () => {
        const finalState = parametersReducer(
          state,
          updateManualNumericFacetRange({
            facetId: 'facetId2',
            start: 0,
            end: 100,
            endInclusive: false,
            state: 'idle',
          })
        );
        expect(finalState).toEqual(state);
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's start value`, () => {
        const finalState = parametersReducer(
          state,
          updateManualNumericFacetRange({
            facetId: 'facetId2',
            start: 1,
            end: 100,
            endInclusive: true,
            state: 'idle',
          })
        );
        expect(finalState).toEqual(state);
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's end value`, () => {
        const finalState = parametersReducer(
          state,
          updateManualNumericFacetRange({
            facetId: 'facetId2',
            start: 0,
            end: 99,
            endInclusive: true,
            state: 'idle',
          })
        );
        expect(finalState).toEqual(state);
      });

      it(`when state.${stateKey}[payload.facetId] is empty, sets state.${stateKey}[payload.facetId] to undefined`, () => {
        const finalState = parametersReducer(
          state,
          updateManualNumericFacetRange({
            facetId: 'facetId1',
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'idle',
          })
        );
        expect(finalState).toEqual({
          ...state,
          [stateKey]: {
            facetId1: undefined,
            facetId2: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
              {start: 100, end: 200, endInclusive: true, state: 'selected'},
            ],
          },
        });
      });
      it(`when state.${stateKey} has no keys, sets state.${stateKey} to undefined`, () => {
        state = {
          ...state,
          [stateKey]: {
            facetId1: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
        };

        const finalState = parametersReducer(
          state,
          updateManualNumericFacetRange({
            facetId: 'facetId1',
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'idle',
          })
        );
        expect(finalState).toEqual({
          ...state,
          [stateKey]: undefined,
        });
      });
    });
  };

  describe('when #updateManualNumericFacetRange is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        updateManualNumericFacetRange({
          facetId: 'facetId',
          start: 0,
          end: 100,
          endInclusive: true,
          state: 'excluded',
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe.each<{stateKey: keyof CommerceParametersState}>([
      {stateKey: 'nf'},
      {stateKey: 'nfExcluded'},
    ])('modifies state.$stateKey as required', ({stateKey}) =>
      testUnsetValueAfterManualNumericRangeUpdate(stateKey)
    );

    describe('when payload.state is "idle"', () => {
      describe.each<{stateKey: keyof CommerceParametersState}>([
        {stateKey: 'mnf'},
        {stateKey: 'mnfExcluded'},
      ])('modifies state.$stateKey as required', ({stateKey}) =>
        testUnsetValueAfterManualNumericRangeUpdate(stateKey)
      );
    });

    describe('when payload.state is "excluded"', () => {
      describe('modifies state.mnf as required', () =>
        testUnsetValueAfterManualNumericRangeUpdate('mnf'));
      it('sets state.mnfExcluded[payload.facetId] to [payload] without facetId', () => {
        const finalState = parametersReducer(
          initialState,
          updateManualNumericFacetRange({
            facetId: 'facetId',
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'excluded',
          })
        );
        expect(finalState).toEqual({
          ...initialState,
          mnfExcluded: {
            facetId: [
              {start: 0, end: 100, endInclusive: true, state: 'excluded'},
            ],
          },
        });
      });
    });

    describe('when payload.state is "selected"', () => {
      describe('modifies state.mnfExcluded as required', () =>
        testUnsetValueAfterManualNumericRangeUpdate('mnfExcluded'));
      it('sets state.mnf[payload.facetId] to [payload] without facetId', () => {
        const finalState = parametersReducer(
          initialState,
          updateManualNumericFacetRange({
            facetId: 'facetId',
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'selected',
          })
        );
        expect(finalState).toEqual({
          ...initialState,
          mnf: {
            facetId: [
              {start: 0, end: 100, endInclusive: true, state: 'selected'},
            ],
          },
        });
      });
    });
  });

  const testUnsetValueAfterDateRangeToggle = (
    stateKey: keyof CommerceParametersState,
    payloadValueState: FacetValueState,
    action:
      | typeof toggleSelectDateFacetValue
      | typeof toggleExcludeDateFacetValue
  ) => {
    describe(`when state.${stateKey}[payload.facetId] is defined`, () => {
      let state: CommerceParametersState;
      beforeEach(() => {
        state = {
          ...initialState,
          [stateKey]: {
            facetId1: [
              {
                start: '2025-01-01',
                end: '2025-12-31',
                endInclusive: true,
                state: 'selected',
              },
            ],
            facetId2: [
              {
                start: '2025-01-01',
                end: '2025-12-31',
                endInclusive: true,
                state: 'selected',
              },
              {
                start: '2026-01-01',
                end: '2026-12-31',
                endInclusive: true,
                state: 'selected',
              },
            ],
          },
        };
      });
      it(`deletes item matching payload's start, end, and endInclusive values from state.${stateKey}[payload.facetId]`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: '2025-01-01',
              end: '2025-12-31',
              endInclusive: true,
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual({
          facetId1: [
            {
              start: '2025-01-01',
              end: '2025-12-31',
              endInclusive: true,
              state: 'selected',
            },
          ],
          facetId2: [
            {
              start: '2026-01-01',
              end: '2026-12-31',
              endInclusive: true,
              state: 'selected',
            },
          ],
        });
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's endInclusive value`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: '2025-01-01',
              end: '2025-12-31',
              endInclusive: false,
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual(state[stateKey]);
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's start value`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: '2025-01-02',
              end: '2025-12-31',
              endInclusive: true,
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual(state[stateKey]);
      });

      it(`does not delete item from state.${stateKey}[payload.facetId] if it does not match payload's end value`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId2',
            selection: {
              start: '2025-01-01',
              end: '2025-12-30',
              endInclusive: true,
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual(state[stateKey]);
      });

      it(`when state.${stateKey}[payload.facetId] is empty, sets state.${stateKey}[payload.facetId] to undefined`, () => {
        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            selection: {
              start: '2025-01-01',
              end: '2025-12-31',
              endInclusive: true,
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toEqual({
          facetId1: undefined,
          facetId2: [
            {
              start: '2025-01-01',
              end: '2025-12-31',
              endInclusive: true,
              state: 'selected',
            },
            {
              start: '2026-01-01',
              end: '2026-12-31',
              endInclusive: true,
              state: 'selected',
            },
          ],
        });
      });
      it(`when state.${stateKey} has no keys, sets state.${stateKey} to undefined`, () => {
        state = {
          ...state,
          [stateKey]: {
            facetId1: [
              {
                start: '2025-01-01',
                end: '2025-12-31',
                endInclusive: true,
                state: 'selected',
              },
            ],
          },
        };

        const finalState = parametersReducer(
          state,
          action({
            facetId: 'facetId1',
            selection: {
              start: '2025-01-01',
              end: '2025-12-31',
              endInclusive: true,
              state: payloadValueState,
              numberOfResults: 1,
            },
          })
        );
        expect(finalState[stateKey]).toBeUndefined();
      });
    });
  };

  describe('when #toggleSelectDateFacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleSelectDateFacetValue({
          facetId: 'facetId',
          selection: {
            start: '2026-01-01',
            end: '2026-12-31',
            endInclusive: true,
            state: 'selected',
            numberOfResults: 1,
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "selected"', () => {
      testUnsetValueAfterDateRangeToggle(
        'dfExcluded',
        'selected',
        toggleSelectDateFacetValue
      );
      testUnsetValueAfterDateRangeToggle(
        'df',
        'selected',
        toggleSelectDateFacetValue
      );
    });

    describe.each<{payloadValueState: FacetValueState}>([
      {payloadValueState: 'excluded'},
      {payloadValueState: 'idle'},
    ])(
      'when payload.selection.state is "$payloadValueState"',
      ({payloadValueState}) => {
        testUnsetValueAfterDateRangeToggle(
          'dfExcluded',
          payloadValueState,
          toggleSelectDateFacetValue
        );
        it('when state.df[payload.facetId] is undefined, creates it and pushes payload.selection.value to it without numberOfResults', () => {
          const value = {
            start: '2025-01-01',
            end: '2025-12-31',
            endInclusive: true,
            state: payloadValueState,
          };

          const finalState = parametersReducer(
            initialState,
            toggleSelectDateFacetValue({
              facetId: 'facetId',
              selection: {...value, numberOfResults: 1},
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            df: {facetId: [value]},
          });
        });
        it('when state.df[payload.facetId] is defined, appends payload.selection.value to it without numberOfResults', () => {
          const state: CommerceParametersState = {
            ...initialState,
            df: {
              facetId: [
                {
                  start: '2025-01-01',
                  end: '2025-12-31',
                  endInclusive: true,
                  state: 'selected',
                },
              ],
            },
          };
          const finalState = parametersReducer(
            state,
            toggleSelectDateFacetValue({
              facetId: 'facetId',
              selection: {
                start: '2026-01-01',
                end: '2026-12-31',
                endInclusive: true,
                state: payloadValueState,
                numberOfResults: 1,
              },
            })
          );
          expect(finalState).toEqual({
            ...state,
            df: {
              facetId: [
                ...state.df!.facetId,
                {
                  start: '2026-01-01',
                  end: '2026-12-31',
                  endInclusive: true,
                  state: payloadValueState,
                },
              ],
            },
          });
        });
      }
    );
  });

  describe('when #toggleExcludeDateFacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleExcludeDateFacetValue({
          facetId: 'facetId',
          selection: {
            start: '2026-01-01',
            end: '2026-12-31',
            endInclusive: true,
            state: 'excluded',
            numberOfResults: 1,
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "excluded"', () => {
      testUnsetValueAfterDateRangeToggle(
        'df',
        'excluded',
        toggleExcludeDateFacetValue
      );
      testUnsetValueAfterDateRangeToggle(
        'dfExcluded',
        'excluded',
        toggleExcludeDateFacetValue
      );
    });

    describe.each<{payloadValueState: FacetValueState}>([
      {payloadValueState: 'selected'},
      {payloadValueState: 'idle'},
    ])(
      'when payload.selection.state is "$payloadValueState"',
      ({payloadValueState}) => {
        testUnsetValueAfterDateRangeToggle(
          'df',
          payloadValueState,
          toggleExcludeDateFacetValue
        );
        it('when state.dfExcluded[payload.facetId] is undefined, creates it and pushes payload.selection.value to it without numberOfResults', () => {
          const value = {
            start: '2025-01-01',
            end: '2025-12-31',
            endInclusive: true,
            state: payloadValueState,
          };

          const finalState = parametersReducer(
            initialState,
            toggleExcludeDateFacetValue({
              facetId: 'facetId',
              selection: {...value, numberOfResults: 1},
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            dfExcluded: {facetId: [value]},
          });
        });
        it('when state.dfExcluded[payload.facetId] is defined, appends payload.selection.value to it without numberOfResults', () => {
          const state: CommerceParametersState = {
            ...initialState,
            dfExcluded: {
              facetId: [
                {
                  start: '2025-01-01',
                  end: '2025-12-31',
                  endInclusive: true,
                  state: 'excluded',
                },
              ],
            },
          };
          const finalState = parametersReducer(
            state,
            toggleExcludeDateFacetValue({
              facetId: 'facetId',
              selection: {
                start: '2026-01-01',
                end: '2026-12-31',
                endInclusive: true,
                state: payloadValueState,
                numberOfResults: 1,
              },
            })
          );
          expect(finalState).toEqual({
            ...state,
            dfExcluded: {
              facetId: [
                ...state.dfExcluded!.facetId,
                {
                  start: '2026-01-01',
                  end: '2026-12-31',
                  endInclusive: true,
                  state: payloadValueState,
                },
              ],
            },
          });
        });
      }
    );
  });

  describe('when #toggleSelectLocationFacetValue is dispatched', () => {
    it('sets state.page to undefined', () => {
      const state = {
        ...initialState,
        page: 5,
      };
      const finalState = parametersReducer(
        state,
        toggleSelectLocationFacetValue({
          facetId: 'facetId',
          selection: {
            value: 'value',
            state: 'selected',
          },
        })
      );
      expect(finalState.page).toBeUndefined();
    });

    describe('when payload.selection.state is "selected"', () => {
      testUnsetValueAfterRegularFacetToggle(
        'lf',
        'selected',
        toggleSelectLocationFacetValue
      );
    });

    describe.each<{payloadValueState: FacetValueState}>([
      {payloadValueState: 'excluded'},
      {payloadValueState: 'idle'},
    ])(
      'when payload.selection.state is $payloadValueState',
      ({payloadValueState}) => {
        it('when state.lf[payload.facetId] is undefined, creates it and pushes payload.selection.value to it', () => {
          const finalState = parametersReducer(
            initialState,
            toggleSelectLocationFacetValue({
              facetId: 'facetId',
              selection: {
                value: 'value',
                state: payloadValueState,
              },
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            lf: {facetId: ['value']},
          });
        });
        it('when state.lf[payload.facetId] is defined, appends payload.selection.value to it', () => {
          const finalState = parametersReducer(
            {...initialState, lf: {facetId: ['value1']}},
            toggleSelectLocationFacetValue({
              facetId: 'facetId',
              selection: {
                value: 'value2',
                state: payloadValueState,
              },
            })
          );
          expect(finalState).toEqual({
            ...initialState,
            lf: {facetId: ['value1', 'value2']},
          });
        });
      }
    );
  });

  it('when #setView is dispatched, resets state', () => {
    const state: CommerceParametersState = {
      cf: {facetId1: ['value1']},
      df: {
        facetId1: [
          {
            start: '2025-01-01',
            end: '2026-12-31',
            endInclusive: true,
            state: 'selected',
          },
        ],
      },
      lf: {facetId1: ['value1']},
      mnf: {
        facetId1: [{start: 0, end: 100, endInclusive: true, state: 'selected'}],
      },
      nf: {
        facetId1: [{start: 0, end: 100, endInclusive: true, state: 'selected'}],
      },
      f: {facetId1: ['value1']},
      fExcluded: {facetId1: ['value1']},
      page: 1,
      perPage: 10,
      q: 'query',
      sortCriteria: {
        by: SortBy.Fields,
        fields: [
          {
            name: 'price',
            direction: SortDirection.Ascending,
            displayName: 'Price (lowest to highest)',
          },
        ],
      },
    };

    const finalState = parametersReducer(
      state,
      setView({url: 'https://example.com'})
    );

    expect(finalState).toEqual(initialState);
  });

  it('when #restoreProductListingParameters is dispatched, sets state to payload', () => {
    const payload: ProductListingParameters = {
      cf: {facetId1: ['value1']},
      df: {
        facetId2: [
          {
            start: '2025-01-01',
            end: '2026-12-31',
            endInclusive: true,
            state: 'selected',
          },
        ],
      },
      dfExcluded: {
        facetId2: [
          {
            start: '2026-01-01',
            end: '2027-12-31',
            endInclusive: true,
            state: 'excluded',
          },
        ],
      },
      lf: {facetId3: ['value1']},
      mnf: {
        facetId4: [{start: 0, end: 100, endInclusive: true, state: 'selected'}],
      },
      mnfExcluded: {
        facetId4: [
          {start: 100, end: 200, endInclusive: true, state: 'excluded'},
        ],
      },
      nf: {
        facetId5: [{start: 0, end: 100, endInclusive: true, state: 'selected'}],
      },
      nfExcluded: {
        facetId5: [
          {start: 100, end: 200, endInclusive: true, state: 'excluded'},
        ],
      },
      f: {facetId6: ['value1']},
      fExcluded: {facetId6: ['value2']},
      page: 1,
      perPage: 10,
      sortCriteria: {
        by: SortBy.Fields,
        fields: [
          {
            name: 'price',
            direction: SortDirection.Ascending,
            displayName: 'Price (lowest to highest)',
          },
        ],
      },
    };

    const finalState = parametersReducer(
      initialState,
      restoreProductListingParameters(payload)
    );

    expect(finalState).toEqual(payload);
  });

  it('when #restoreSearchParameters is dispatched, sets state to payload', () => {
    const payload: CommerceSearchParameters = {
      cf: {facetId1: ['value1']},
      df: {
        facetId2: [
          {
            start: '2025-01-01',
            end: '2026-12-31',
            endInclusive: true,
            state: 'selected',
          },
        ],
      },
      dfExcluded: {
        facetId2: [
          {
            start: '2026-01-01',
            end: '2027-12-31',
            endInclusive: true,
            state: 'excluded',
          },
        ],
      },
      lf: {facetId3: ['value1']},
      mnf: {
        facetId4: [{start: 0, end: 100, endInclusive: true, state: 'selected'}],
      },
      mnfExcluded: {
        facetId4: [
          {start: 100, end: 200, endInclusive: true, state: 'excluded'},
        ],
      },
      nf: {
        facetId5: [{start: 0, end: 100, endInclusive: true, state: 'selected'}],
      },
      nfExcluded: {
        facetId5: [
          {start: 100, end: 200, endInclusive: true, state: 'excluded'},
        ],
      },
      f: {facetId6: ['value1']},
      fExcluded: {facetId6: ['value2']},
      page: 1,
      perPage: 10,
      sortCriteria: {
        by: SortBy.Fields,
        fields: [
          {
            name: 'price',
            direction: SortDirection.Ascending,
            displayName: 'Price (lowest to highest)',
          },
        ],
      },
      q: 'query',
    };

    const finalState = parametersReducer(
      initialState,
      restoreProductListingParameters(payload)
    );

    expect(finalState).toEqual(payload);
  });
});
