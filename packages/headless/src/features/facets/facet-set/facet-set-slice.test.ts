import type {PayloadAction} from '@reduxjs/toolkit';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../../test/mock-facet-response.js';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {buildMockFacetValue} from '../../../test/mock-facet-value.js';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request.js';
import {buildMockSearch} from '../../../test/mock-search.js';
import {logSearchEvent} from '../../analytics/analytics-actions.js';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../breadcrumb/breadcrumb-actions.js';
import {change} from '../../history/history-actions.js';
import {getHistoryInitialState} from '../../history/history-state.js';
import {
  type ExecuteSearchThunkReturn,
  executeSearch,
  fetchFacetValues,
} from '../../search/search-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions.js';
import {type FacetValueState, facetValueStates} from './../facet-api/value.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../facet-search-set/specific/specific-facet-search-actions.js';
import {updateFacetAutoSelection} from '../generic/facet-actions.js';
import * as FacetReducers from '../generic/facet-reducer-helpers.js';
import {
  deselectAllFacetValues,
  type RegisterFacetActionCreatorPayload,
  registerFacet,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
  updateFacetSortCriterion,
  updateFreezeCurrentValues,
} from './facet-set-actions.js';
import {
  convertFacetValueToRequest,
  facetSetReducer,
} from './facet-set-slice.js';
import {
  type FacetSetState,
  getFacetSetInitialState,
} from './facet-set-state.js';
import type {FacetResponse} from './interfaces/response.js';

describe('facet-set slice', () => {
  let state: FacetSetState;

  function buildRegistrationOptions(
    config: Partial<RegisterFacetActionCreatorPayload>
  ): RegisterFacetActionCreatorPayload {
    return {
      facetId: '',
      field: '',
      ...config,
    };
  }

  beforeEach(() => {
    state = getFacetSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('registers a facet request with the passed field and expected default values', () => {
    const facetId = '1';
    const options = buildRegistrationOptions({facetId, field: 'author'});
    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);

    const expectedFacet = {
      facetId,
      field: options.field,
      type: 'specific',
      currentValues: [],
      filterFacetCount: true,
      freezeCurrentValues: false,
      injectionDepth: 1000,
      isFieldExpanded: false,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
    };

    expect(finalState[facetId]?.request).toEqual(expectedFacet);
  });

  it('registers a facet request with the passed optional values', () => {
    const matchCriterion = 'allValues';
    const sortCriterion = 'alphanumeric';
    const options = buildRegistrationOptions({
      sortCriteria: sortCriterion,
      resultsMustMatch: matchCriterion,
      allowedValues: {type: 'simple', values: ['foo', 'bar']},
      customSort: ['bar', 'buzz', 'foo'],
    });

    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);
    const {request: facetRequest} = finalState[options.facetId];

    expect(facetRequest.resultsMustMatch).toBe(matchCriterion);
    expect(facetRequest.sortCriteria).toBe(sortCriterion);
    expect(facetRequest.allowedValues?.values).toEqual(['foo', 'bar']);
    expect(facetRequest.customSort).toEqual(['bar', 'buzz', 'foo']);
  });

  it('if a facet request is already registered for an id, it does not overwrite the request', () => {
    const id = '1';
    state[id] = buildMockFacetSlice();

    const options = buildRegistrationOptions({facetId: id, field: 'author'});
    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);

    expect(finalState[id].request.field).toBe(state[id].request.field);
  });

  it('allows to restore a facet set on history change', () => {
    const state = getFacetSetInitialState();
    const expectedFacetSet = {
      foo: buildMockFacetSlice(),
    };
    const historyChange = {
      ...getHistoryInitialState(),
      facetSet: expectedFacetSet,
    };

    const nextState = facetSetReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual(expectedFacetSet);
  });

  it('ignore an empty facet set on history change', () => {
    const state = {foo: buildMockFacetSlice()};
    const emptyFacetSet = {};
    const historyChange = {
      ...getHistoryInitialState(),
      facetSet: emptyFacetSet,
    };

    const nextState = facetSetReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual(state);
  });

  describe.each([
    {
      title: 'dispatching #toggleSelectFacetValue with a registered facet id',
      facetValueState: 'selected' as FacetValueState,
      toggleAction: toggleSelectFacetValue,
    },
    {
      title: 'dispatching #toggleExcludeFacetValue with a registered facet id',
      facetValueState: 'excluded' as FacetValueState,
      toggleAction: toggleExcludeFacetValue,
    },
  ])('$title', ({facetValueState, toggleAction}) => {
    const id = '1';
    const oppositeFacetValueState = facetValueStates.find(
      (valueState) => ![facetValueState, 'idle'].includes(valueState)
    );
    describe('when the facet value exists', () => {
      it(`sets the state of an idle value to ${facetValueState}`, () => {
        const facetValue = buildMockFacetValue({value: 'TED'});
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId: id,
          selection: facetValue,
        });
        const finalState = facetSetReducer(state, action);

        const targetValue = finalState[id]?.request.currentValues.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.state).toBe(facetValueState);
        expect(targetValue?.previousState).toBe('idle');
      });

      it(`sets the previousState of a ${facetValueState} value to idle`, () => {
        const facetValue = buildMockFacetValue({
          value: 'TED',
          state: facetValueState,
        });
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId: id,
          selection: facetValue,
        });
        const finalState = facetSetReducer(state, action);

        const targetValue = finalState[id]?.request.currentValues.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.previousState).toBe(facetValueState);
      });

      it(`does not set the previousState of value transitioning from ${facetValueState} to ${facetValueState}`, () => {
        const facetValue = buildMockFacetValue({
          value: 'TED',
          state: 'selected',
        });
        const facetValueRequest = convertFacetValueToRequest(facetValue);
        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({currentValues: [facetValueRequest]}),
        });

        const action = toggleSelectFacetValue({
          facetId: id,
          selection: buildMockFacetValue(),
        });
        const finalState = facetSetReducer(state, action);

        const targetValue = finalState[id]?.request.currentValues.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.previousState).toBeUndefined();
      });

      it(`sets the state of an ${oppositeFacetValueState} value to ${facetValueState}`, () => {
        const facetValue = buildMockFacetValue({
          value: 'TED',
          state: oppositeFacetValueState,
        });
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId: id,
          selection: facetValue,
        });
        const finalState = facetSetReducer(state, action);

        const targetValue = finalState[id]?.request.currentValues.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.state).toBe(facetValueState);
        expect(targetValue?.previousState).toBe(oppositeFacetValueState);
      });

      it(`sets the state of a ${facetValueState} value to idle`, () => {
        const facetValue = buildMockFacetValue({
          value: 'TED',
          state: facetValueState,
        });
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId: id,
          selection: facetValue,
        });
        const finalState = facetSetReducer(state, action);

        const targetValue = finalState[id]?.request.currentValues.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.state).toBe('idle');
        expect(targetValue?.previousState).toBe(facetValueState);
      });

      it('sets #freezeCurrentValues to true', () => {
        const facetValue = buildMockFacetValue({value: 'TED'});
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId: id,
          selection: facetValue,
        });
        const finalState = facetSetReducer(state, action);

        expect(finalState[id]?.request.freezeCurrentValues).toBe(true);
      });

      it('sets #preventAutoSelect to true', () => {
        const facetValue = buildMockFacetValue({value: 'TED'});
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[id] = buildMockFacetSlice({
          request: buildMockFacetRequest({
            currentValues: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId: id,
          selection: facetValue,
        });
        const finalState = facetSetReducer(state, action);

        expect(finalState[id]?.request.preventAutoSelect).toBe(true);
      });
    });

    describe.each([
      {
        facetValueState: 'selected' as FacetValueState,
        toggleAction: toggleSelectFacetValue,
      },
      {
        facetValueState: 'excluded' as FacetValueState,
        toggleAction: toggleExcludeFacetValue,
      },
    ])(
      'when the facet value does not exist',
      ({facetValueState, toggleAction}) => {
        it('inserts the new value before the first idle value and removes the last value', () => {
          const newFacetValue = buildMockFacetValue({
            value: 'TED',
            state: facetValueState,
          });

          state[id] = buildMockFacetSlice({
            request: buildMockFacetRequest({
              numberOfValues: 4,
              currentValues: [
                buildMockFacetValue({
                  value: 'active1',
                  state: facetValueState,
                }),
                buildMockFacetValue({
                  value: 'active2',
                  state: facetValueState,
                }),
                buildMockFacetValue({value: 'idle1', state: 'idle'}),
                buildMockFacetValue({value: 'idle2', state: 'idle'}),
              ],
            }),
          });

          const action = toggleAction({
            facetId: id,
            selection: newFacetValue,
          });

          const finalState = facetSetReducer(state, action);
          expect(
            finalState[id]?.request.currentValues.indexOf(newFacetValue)
          ).toBe(2);
          expect(finalState[id]?.request.currentValues.length).toBe(4);
        });

        it('does not set #freezeCurrentValues to true', () => {
          state[id] = buildMockFacetSlice({
            request: buildMockFacetRequest({currentValues: []}),
          });

          const action = toggleAction({
            facetId: id,
            selection: buildMockFacetValue({value: 'TED'}),
          });
          const finalState = facetSetReducer(state, action);

          expect(finalState[id]?.request.freezeCurrentValues).toBe(false);
        });

        it('sets #preventAutoSelect to true', () => {
          state[id] = buildMockFacetSlice({
            request: buildMockFacetRequest({currentValues: []}),
          });

          const action = toggleAction({
            facetId: id,
            selection: buildMockFacetValue({value: 'TED'}),
          });
          const finalState = facetSetReducer(state, action);

          expect(finalState[id]?.request.preventAutoSelect).toBe(true);
        });
      }
    );
  });

  it('dispatching #toggleSelectFacetValue with an invalid id does not throw', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    const action = toggleSelectFacetValue({
      facetId: '1',
      selection: facetValue,
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it('dispatching #toggleExcludeFacetValue with an invalid id does not throw', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    const action = toggleExcludeFacetValue({
      facetId: '1',
      selection: facetValue,
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it(`dispatching #updateFreezeCurrentValues with a registered facet id
  sets the state updateFreezeCurrentValues to the value`, () => {
    const id = '1';

    state[id] = buildMockFacetSlice();

    const action = updateFreezeCurrentValues({
      facetId: id,
      freezeCurrentValues: true,
    });
    const finalState = facetSetReducer(state, action);
    expect(finalState[id]?.request.freezeCurrentValues).toBe(true);
  });

  it('dispatching #updateFreezeCurrentValues with an invalid id does not throw', () => {
    const action = updateFreezeCurrentValues({
      facetId: '1',
      freezeCurrentValues: true,
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it('dispatching #deselectAllFacetValues calls #handleFacetDeselectAll', () => {
    vi.spyOn(FacetReducers, 'handleFacetDeselectAll');
    facetSetReducer(state, deselectAllFacetValues('1'));

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('dispatching #updateFacetAutoSelection updates autoSelection for all facets', () => {
    state['1'] = buildMockFacetSlice({
      request: buildMockFacetRequest({preventAutoSelect: true}),
    });
    state['2'] = buildMockFacetSlice({
      request: buildMockFacetRequest({preventAutoSelect: true}),
    });
    const finalState = facetSetReducer(
      state,
      updateFacetAutoSelection({allow: true})
    );
    expect(finalState['1']?.request.preventAutoSelect).toBe(false);
    expect(finalState['2']?.request.preventAutoSelect).toBe(false);
  });

  it('dispatching #deselectAllBreadcrumbs calls #handleFacetDeselectAll for every facet', () => {
    vi.spyOn(FacetReducers, 'handleFacetDeselectAll').mockReset();

    state['1'] = buildMockFacetSlice();
    state['2'] = buildMockFacetSlice();
    facetSetReducer(state, deselectAllBreadcrumbs());

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(2);
  });

  it('dispatching #deselectAllBreadcrumbs does not call #handleFacetDeselectAll for a facet where hasBreadcrumbs is false', () => {
    vi.spyOn(FacetReducers, 'handleFacetDeselectAll').mockReset();

    state['1'] = buildMockFacetSlice({
      hasBreadcrumbs: false,
    });
    facetSetReducer(state, deselectAllBreadcrumbs());

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(0);
  });

  it('dispatching #deselectAllBreadcrumbs does not call #handleFacetDeselectAll for a facet where hasBreadcrumbs is false', () => {
    vi.spyOn(FacetReducers, 'handleFacetDeselectAll').mockReset();

    state['1'] = buildMockFacetSlice({
      hasBreadcrumbs: false,
    });
    state['2'] = buildMockFacetSlice({
      hasBreadcrumbs: true,
    });
    state['3'] = buildMockFacetSlice({
      hasBreadcrumbs: true,
    });
    facetSetReducer(state, deselectAllNonBreadcrumbs());

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('dispatching #updateFacetSortCriterion calls #handleFacetSortCriterionUpdate', () => {
    vi.spyOn(FacetReducers, 'handleFacetSortCriterionUpdate');
    const action = updateFacetSortCriterion({
      facetId: '1',
      criterion: 'alphanumeric',
    });
    facetSetReducer(state, action);

    expect(FacetReducers.handleFacetSortCriterionUpdate).toHaveBeenCalledTimes(
      1
    );
  });

  it('dispatching #updateFacetNumberOfValues calls #handleFacetUpdateNumberOfValues', () => {
    vi.spyOn(FacetReducers, 'handleFacetUpdateNumberOfValues');
    facetSetReducer(
      state,
      updateFacetNumberOfValues({
        facetId: '1',
        numberOfValues: 20,
      })
    );

    expect(FacetReducers.handleFacetUpdateNumberOfValues).toHaveBeenCalledTimes(
      1
    );
  });

  describe('#updateFacetIsFieldExpanded', () => {
    it('dispatching with a registered id updates the value', () => {
      const facetId = '1';
      const isFieldExpanded = true;
      state[facetId] = buildMockFacetSlice({
        request: buildMockFacetRequest({
          isFieldExpanded: !isFieldExpanded,
        }),
      });

      const action = updateFacetIsFieldExpanded({facetId, isFieldExpanded});
      const finalState = facetSetReducer(state, action);

      expect(finalState[facetId]?.request.isFieldExpanded).toBe(
        isFieldExpanded
      );
    });

    it('dispatching with an unregistered id does not throw', () => {
      const action = updateFacetIsFieldExpanded({
        facetId: '1',
        isFieldExpanded: true,
      });
      expect(() => facetSetReducer(state, action)).not.toThrow();
    });
  });

  function testFulfilledSearchRequest(
    searchBuilder: (
      facets: FacetResponse[]
    ) => PayloadAction<ExecuteSearchThunkReturn, string>
  ) {
    it('updates the currentValues of facet requests to the values in the response', () => {
      const id = '1';
      const facetValue = buildMockFacetValue({value: 'TED'});
      const facet = buildMockFacetResponse({facetId: id, values: [facetValue]});

      state[id] = buildMockFacetSlice({
        request: buildMockFacetRequest({facetId: id}),
      });

      const action = searchBuilder([facet]);
      const finalState = facetSetReducer(state, action);

      const expectedFacetValueRequest = convertFacetValueToRequest(facetValue);
      expect(finalState[id]?.request.currentValues).toEqual([
        expectedFacetValueRequest,
      ]);
    });

    it('sets #freezeCurrentValues to false', () => {
      const id = '1';
      state[id] = buildMockFacetSlice({
        request: buildMockFacetRequest({freezeCurrentValues: true}),
      });

      const facet = buildMockFacetResponse({facetId: id});
      const action = searchBuilder([facet]);

      const finalState = facetSetReducer(state, action);
      expect(finalState[id]?.request.freezeCurrentValues).toBe(false);
    });

    it('sets #preventAutoSelect to false', () => {
      const id = '1';
      state[id] = buildMockFacetSlice({
        request: buildMockFacetRequest({preventAutoSelect: true}),
      });

      const facet = buildMockFacetResponse({facetId: id});
      const action = searchBuilder([facet]);

      const finalState = facetSetReducer(state, action);
      expect(finalState[id]?.request.preventAutoSelect).toBe(false);
    });

    it('response containing unregistered facet ids does not throw', () => {
      const id = '1';
      const facet = buildMockFacetResponse({facetId: id});
      const action = searchBuilder([facet]);

      expect(() => facetSetReducer(state, action)).not.toThrow();
    });
  }

  describe('#executeSearch.fulfilled', () => {
    function buildExecuteSearchAction(facets: FacetResponse[]) {
      const search = buildMockSearch();
      search.response.facets = facets;

      return executeSearch.fulfilled(search, '', {
        legacy: logSearchEvent({evt: 'foo'}),
      });
    }

    testFulfilledSearchRequest(buildExecuteSearchAction);
  });

  describe('#fetchFacetValues.fulfilled', () => {
    function buildFetchFacetValuesAction(facets: FacetResponse[]) {
      const search = buildMockSearch();
      search.response.facets = facets;

      return fetchFacetValues.fulfilled(search, '', {
        legacy: logSearchEvent({evt: 'foo'}),
      });
    }

    testFulfilledSearchRequest(buildFetchFacetValuesAction);
  });

  describe.each([
    {
      title: '#selectFacetSearchResult with a registered id',
      facetValueState: 'selected' as FacetValueState,
      dispatchFunction: selectFacetSearchResult,
    },
    {
      title: '#excludeFacetSearchResult with a registered id',
      facetValueState: 'excluded' as FacetValueState,
      dispatchFunction: excludeFacetSearchResult,
    },
  ])('$title', ({facetValueState, dispatchFunction}) => {
    const facetId = '1';
    const rawValue = 'TED';
    const expectedSearchResultValue = buildMockFacetValueRequest({
      value: rawValue,
      state: facetValueState,
    });

    function dispatchFacetSearchResultAction() {
      const value = buildMockFacetSearchResult({rawValue});
      const action = dispatchFunction({facetId, value});
      state = facetSetReducer(state, action);
    }

    function getFacetRequest() {
      return state[facetId]?.request;
    }

    beforeEach(() => {
      state[facetId] = buildMockFacetSlice();
    });

    it(`adds the #value.rawValue to #currentValues with #state.${facetValueState}`, () => {
      dispatchFacetSearchResultAction();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toContainEqual(expectedSearchResultValue);
    });

    it('it updates the #numberOfResults to the new number of currentValues', () => {
      dispatchFacetSearchResultAction();
      const {currentValues, numberOfValues} = getFacetRequest();
      expect(numberOfValues).toBe(currentValues.length);
    });

    it('it sets #freezeCurrentValues to true', () => {
      dispatchFacetSearchResultAction();
      const {freezeCurrentValues} = getFacetRequest();
      expect(freezeCurrentValues).toBe(true);
    });

    it('it sets #preventAutoSelect to true', () => {
      dispatchFacetSearchResultAction();
      const {preventAutoSelect} = getFacetRequest();
      expect(preventAutoSelect).toBe(true);
    });

    it(`when the #value.rawValue already exists and is ${facetValueState}, it does not add a duplicate`, () => {
      dispatchFacetSearchResultAction();
      dispatchFacetSearchResultAction();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([expectedSearchResultValue]);
    });

    it('when the #value.rawValue already exists and is idle, it selects the value', () => {
      state[facetId]!.request.currentValues = [
        buildMockFacetValueRequest({value: rawValue, state: 'idle'}),
      ];
      dispatchFacetSearchResultAction();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([expectedSearchResultValue]);
    });

    it('when there are idle values, the search result pushes idle values down, removing the last value', () => {
      const valueA = buildMockFacetValueRequest({value: 'A'});
      const valueB = buildMockFacetValueRequest({value: 'B'});

      state[facetId]!.request.currentValues = [valueA, valueB];
      state[facetId]!.request.numberOfValues = 2;
      dispatchFacetSearchResultAction();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([expectedSearchResultValue, valueA]);
    });

    it(`when there are only ${facetValueState} values, it adds the search result to the end`, () => {
      const activeValue = buildMockFacetValueRequest({
        state: facetValueState,
      });
      const activeValue2 = buildMockFacetValueRequest({
        state: facetValueState,
      });
      state[facetId]!.request.currentValues = [activeValue, activeValue2];
      state[facetId]!.request.numberOfValues = 2;
      dispatchFacetSearchResultAction();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([
        activeValue,
        activeValue2,
        expectedSearchResultValue,
      ]);
    });
  });

  it('when the passed id is not registered, #selectFacetSearchResult does not throw', () => {
    const value = buildMockFacetSearchResult({rawValue: 'TED'});
    const action = selectFacetSearchResult({facetId: '1', value});
    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it('when the passed id is not registered, #excludeFacetSearchResult does not throw', () => {
    const value = buildMockFacetSearchResult({rawValue: 'TED'});
    const action = excludeFacetSearchResult({facetId: '1', value});
    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  describe('#restoreSearchParameters', () => {
    it(`when a facet is found in the #f payload,
    it sets #currentValues to the selected values in the payload`, () => {
      const facetId = 'author';
      const valueA = buildMockFacetValueRequest({value: 'a'});
      const valueB = buildMockFacetValueRequest({value: 'b'});
      state[facetId] = buildMockFacetSlice({
        request: buildMockFacetRequest({currentValues: [valueA, valueB]}),
      });
      const f = {[facetId]: ['a']};
      const finalState = facetSetReducer(state, restoreSearchParameters({f}));
      const selectedValue = buildMockFacetValueRequest({
        value: 'a',
        state: 'selected',
      });
      expect(finalState[facetId]?.request.currentValues).toEqual([
        selectedValue,
        valueB,
      ]);
    });

    it(`when the number of values in the payload is greater than the number of values on the request,
    it sets the request #numberOfValues to the length of the payload`, () => {
      const facetId = 'author';
      state[facetId] = buildMockFacetSlice({
        request: buildMockFacetRequest({numberOfValues: 1}),
      });

      const f = {[facetId]: ['a', 'b']};
      const finalState = facetSetReducer(state, restoreSearchParameters({f}));

      expect(finalState[facetId]?.request.numberOfValues).toBe(2);
    });

    it(`when the number of values in the payload is less than the number of values on the request,
    it does not change the request #numberOfValues`, () => {
      const facetId = 'author';
      state[facetId] = buildMockFacetSlice({
        request: buildMockFacetRequest({numberOfValues: 8}),
      });

      const f = {[facetId]: ['a']};
      const finalState = facetSetReducer(state, restoreSearchParameters({f}));

      expect(finalState[facetId]?.request.numberOfValues).toBe(8);
    });

    it.each([
      {hash: 'f', facetValueState: 'selected' as FacetValueState},
      {hash: 'fExcluded', facetValueState: 'excluded' as FacetValueState},
    ])(
      `when a facet is not found in the #$hash payload,
    it deselects all values by setting the state of each facet value in #currentValues to idle`,
      ({facetValueState}) => {
        const currentValues = [
          buildMockFacetValueRequest({state: facetValueState}),
        ];
        state.author = buildMockFacetSlice({
          request: buildMockFacetRequest({currentValues}),
        });

        const finalState = facetSetReducer(state, restoreSearchParameters({}));
        expect(finalState.author?.request.currentValues).toEqual([
          buildMockFacetValueRequest(),
        ]);
      }
    );

    it('sets #preventAutoSelect to true on facets with at least one value selected', () => {
      const a = 'a';
      const b = 'b';

      state[a] = buildMockFacetSlice({
        request: buildMockFacetRequest({preventAutoSelect: false}),
      });
      state[b] = buildMockFacetSlice({
        request: buildMockFacetRequest({preventAutoSelect: false}),
      });
      const f = {[a]: [], [b]: ['foo', 'bar']};

      const finalState = facetSetReducer(state, restoreSearchParameters({f}));
      expect(finalState[a]?.request.preventAutoSelect).toBe(false);
      expect(finalState[b]?.request.preventAutoSelect).toBe(true);
    });
  });
});
