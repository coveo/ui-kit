import {facetSetReducer, convertFacetValueToRequest} from './facet-set-slice';
import {change} from '../../history/history-actions';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
  updateFacetIsFieldExpanded,
  updateFreezeCurrentValues,
  RegisterFacetActionCreatorPayload,
} from './facet-set-actions';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockSearch} from '../../../test/mock-search';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {executeSearch} from '../../search/search-actions';
import {logSearchEvent} from '../../analytics/analytics-actions';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {FacetResponse} from './interfaces/response';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {selectFacetSearchResult} from '../facet-search-set/specific/specific-facet-search-actions';
import * as FacetReducers from '../generic/facet-reducer-helpers';
import {FacetSetState, getFacetSetInitialState} from './facet-set-state';
import {deselectAllFacets} from '../generic/facet-actions';
import {getHistoryInitialState} from '../../history/history-state';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';

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
      delimitingCharacter: '>',
      filterFacetCount: true,
      freezeCurrentValues: false,
      injectionDepth: 1000,
      isFieldExpanded: false,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'automatic',
    };

    expect(finalState[facetId]).toEqual(expectedFacet);
  });

  it('registers a facet request with the passed optional values', () => {
    const criterion = 'alphanumeric';
    const options = buildRegistrationOptions({sortCriteria: criterion});

    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);
    const facetRequest = finalState[options.facetId];

    expect(facetRequest.sortCriteria).toBe(criterion);
  });

  it('if a facet request is already registered for an id, it does not overwrite the request', () => {
    const id = '1';
    state[id] = buildMockFacetRequest();

    const options = buildRegistrationOptions({facetId: id, field: 'author'});
    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);

    expect(finalState[id].field).toBe(state[id].field);
  });

  it('allows to restore a facet set on history change', () => {
    const state = getFacetSetInitialState();
    const expectedFacetSet = {
      foo: buildMockFacetRequest(),
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
    const state = {foo: buildMockFacetRequest()};
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

  describe('dispatching #toggleSelectFacetValue with a registered facet id', () => {
    it('sets the state of an idle value to selected', () => {
      const id = '1';

      const facetValue = buildMockFacetValue({value: 'TED'});
      const facetValueRequest = convertFacetValueToRequest(facetValue);

      state[id] = buildMockFacetRequest({currentValues: [facetValueRequest]});

      const action = toggleSelectFacetValue({
        facetId: id,
        selection: facetValue,
      });
      const finalState = facetSetReducer(state, action);

      const targetValue = finalState[id].currentValues.find(
        (req) => req.value === facetValue.value
      );
      expect(targetValue?.state).toBe('selected');
    });

    it('sets the state of a selected value to idle', () => {
      const id = '1';

      const facetValue = buildMockFacetValue({value: 'TED', state: 'selected'});
      const facetValueRequest = convertFacetValueToRequest(facetValue);

      state[id] = buildMockFacetRequest({currentValues: [facetValueRequest]});

      const action = toggleSelectFacetValue({
        facetId: id,
        selection: facetValue,
      });
      const finalState = facetSetReducer(state, action);

      const targetValue = finalState[id].currentValues.find(
        (req) => req.value === facetValue.value
      );
      expect(targetValue?.state).toBe('idle');
    });

    it('sets #freezeCurrentValues to true', () => {
      const id = '1';

      const facetValue = buildMockFacetValue({value: 'TED'});
      const facetValueRequest = convertFacetValueToRequest(facetValue);

      state[id] = buildMockFacetRequest({currentValues: [facetValueRequest]});

      const action = toggleSelectFacetValue({
        facetId: id,
        selection: facetValue,
      });
      const finalState = facetSetReducer(state, action);

      expect(finalState[id].freezeCurrentValues).toBe(true);
    });

    it('sets #preventAutoSelect to true', () => {
      const id = '1';

      const facetValue = buildMockFacetValue({value: 'TED'});
      const facetValueRequest = convertFacetValueToRequest(facetValue);

      state[id] = buildMockFacetRequest({currentValues: [facetValueRequest]});

      const action = toggleSelectFacetValue({
        facetId: id,
        selection: facetValue,
      });
      const finalState = facetSetReducer(state, action);

      expect(finalState[id].preventAutoSelect).toBe(true);
    });
  });

  it('dispatching #toggleSelectFacetValue with an invalid id does not throw', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    const action = toggleSelectFacetValue({
      facetId: '1',
      selection: facetValue,
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it(`dispatching #updateFreezeCurrentValues with a registered facet id
  sets the state updateFreezeCurrentValues to the value`, () => {
    const id = '1';

    state[id] = buildMockFacetRequest();

    const action = updateFreezeCurrentValues({
      facetId: id,
      freezeCurrentValues: true,
    });
    const finalState = facetSetReducer(state, action);
    expect(finalState[id].freezeCurrentValues).toBe(true);
  });

  it('dispatching #updateFreezeCurrentValues with an invalid id does not throw', () => {
    const action = updateFreezeCurrentValues({
      facetId: '1',
      freezeCurrentValues: true,
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it('dispatching #deselectAllFacetValues calls #handleFacetDeselectAll', () => {
    jest.spyOn(FacetReducers, 'handleFacetDeselectAll');
    facetSetReducer(state, deselectAllFacetValues('1'));

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllFacets calls #handleFacetDeselectAll for every facet', () => {
    jest.spyOn(FacetReducers, 'handleFacetDeselectAll');

    state['1'] = buildMockFacetRequest();
    state['2'] = buildMockFacetRequest();
    state['3'] = buildMockFacetRequest();
    facetSetReducer(state, deselectAllFacets());

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(4);
  });

  it('dispatching #updateFacetSortCriterion calls #handleFacetSortCriterionUpdate', () => {
    jest.spyOn(FacetReducers, 'handleFacetSortCriterionUpdate');
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
    jest.spyOn(FacetReducers, 'handleFacetUpdateNumberOfValues');
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
      state[facetId] = buildMockFacetRequest({
        isFieldExpanded: !isFieldExpanded,
      });

      const action = updateFacetIsFieldExpanded({facetId, isFieldExpanded});
      const finalState = facetSetReducer(state, action);

      expect(finalState[facetId].isFieldExpanded).toBe(isFieldExpanded);
    });

    it('dispatching with an unregistered id does not throw', () => {
      const action = updateFacetIsFieldExpanded({
        facetId: '1',
        isFieldExpanded: true,
      });
      expect(() => facetSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#executeSearch.fulfilled', () => {
    function buildExecuteSearchAction(facets: FacetResponse[]) {
      const search = buildMockSearch();
      search.response.facets = facets;

      return executeSearch.fulfilled(search, '', logSearchEvent({evt: 'foo'}));
    }

    it('updates the currentValues of facet requests to the values in the response', () => {
      const id = '1';
      const facetValue = buildMockFacetValue({value: 'TED'});
      const facet = buildMockFacetResponse({facetId: id, values: [facetValue]});

      state[id] = buildMockFacetRequest({facetId: id});

      const action = buildExecuteSearchAction([facet]);
      const finalState = facetSetReducer(state, action);

      const expectedFacetValueRequest = convertFacetValueToRequest(facetValue);
      expect(finalState[id].currentValues).toEqual([expectedFacetValueRequest]);
    });

    it('sets #freezeCurrentValues to false', () => {
      const id = '1';
      state[id] = buildMockFacetRequest({freezeCurrentValues: true});

      const facet = buildMockFacetResponse({facetId: id});
      const action = buildExecuteSearchAction([facet]);

      const finalState = facetSetReducer(state, action);
      expect(finalState[id].freezeCurrentValues).toBe(false);
    });

    it('sets #preventAutoSelect to false', () => {
      const id = '1';
      state[id] = buildMockFacetRequest({preventAutoSelect: true});

      const facet = buildMockFacetResponse({facetId: id});
      const action = buildExecuteSearchAction([facet]);

      const finalState = facetSetReducer(state, action);
      expect(finalState[id].preventAutoSelect).toBe(false);
    });

    it('response containing unregistered facet ids does not throw', () => {
      const id = '1';
      const facet = buildMockFacetResponse({facetId: id});
      const action = buildExecuteSearchAction([facet]);

      expect(() => facetSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#selectFacetSearchResult with a registered id', () => {
    const facetId = '1';
    const rawValue = 'TED';
    const expectedSearchResultValue = buildMockFacetValueRequest({
      value: rawValue,
      state: 'selected',
    });

    function dispatchSelectFacetSearchResult() {
      const value = buildMockFacetSearchResult({rawValue});
      const action = selectFacetSearchResult({facetId, value});
      state = facetSetReducer(state, action);
    }

    function getFacetRequest() {
      return state[facetId];
    }

    beforeEach(() => {
      state[facetId] = buildMockFacetRequest();
    });

    it('adds the #value.rawValue to #currentValues with #state.selected', () => {
      dispatchSelectFacetSearchResult();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toContainEqual(expectedSearchResultValue);
    });

    it('it updates the #numberOfResults to the new number of currentValues', () => {
      dispatchSelectFacetSearchResult();
      const {currentValues, numberOfValues} = getFacetRequest();
      expect(numberOfValues).toBe(currentValues.length);
    });

    it('it sets #freezeCurrentValues to true', () => {
      dispatchSelectFacetSearchResult();
      const {freezeCurrentValues} = getFacetRequest();
      expect(freezeCurrentValues).toBe(true);
    });

    it('it sets #preventAutoSelect to true', () => {
      dispatchSelectFacetSearchResult();
      const {preventAutoSelect} = getFacetRequest();
      expect(preventAutoSelect).toBe(true);
    });

    it('when the #value.rawValue already exists and is selected, it does not add a duplicate', () => {
      dispatchSelectFacetSearchResult();
      dispatchSelectFacetSearchResult();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([expectedSearchResultValue]);
    });

    it('when the #value.rawValue already exists and is idle, it selects the value', () => {
      state[facetId].currentValues = [
        buildMockFacetValueRequest({value: rawValue, state: 'idle'}),
      ];
      dispatchSelectFacetSearchResult();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([expectedSearchResultValue]);
    });

    it('when there are idle values, the search result replaces the first idle value', () => {
      // [KIT-107] If the selected result is appended, we will request one extra value than
      // we need, creating an inconsistent UX. If the numberOfValues is kept the same (e.g. because
      // we detect at an idle value), then the showLess button will momentarily flicker as the
      // number of currentValues is greater than the original number of requested values.
      // Instead, we replace an idle value, keeping the number of values the same.
      const valueA = buildMockFacetValueRequest({value: 'A'});
      const valueB = buildMockFacetValueRequest({value: 'B'});

      state[facetId].currentValues = [valueA, valueB];
      dispatchSelectFacetSearchResult();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([expectedSearchResultValue, valueB]);
    });

    it('when there are only selected values, it adds the search result to the end', () => {
      const selectedValue = buildMockFacetValueRequest({state: 'selected'});
      state[facetId].currentValues = [selectedValue];
      dispatchSelectFacetSearchResult();

      const {currentValues} = getFacetRequest();
      expect(currentValues).toEqual([selectedValue, expectedSearchResultValue]);
    });
  });

  it('when the passed id is not registered, #selectFacetSearchResult does not throw', () => {
    const value = buildMockFacetSearchResult({rawValue: 'TED'});
    const action = selectFacetSearchResult({facetId: '1', value});
    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  describe('#restoreSearchParameters', () => {
    it(`when a facet is found in the #f payload,
    it sets #currentValues to the selected values in the payload`, () => {
      const facetId = 'author';
      state[facetId] = buildMockFacetRequest();

      const f = {[facetId]: ['a']};
      const finalState = facetSetReducer(state, restoreSearchParameters({f}));

      const value = buildMockFacetValueRequest({value: 'a', state: 'selected'});
      expect(finalState[facetId].currentValues).toEqual([value]);
    });

    it(`when the number of values in the payload is greater than the number of values on the request,
    it sets the request #numberOfValues to the length of the payload`, () => {
      const facetId = 'author';
      state[facetId] = buildMockFacetRequest({numberOfValues: 1});

      const f = {[facetId]: ['a', 'b']};
      const finalState = facetSetReducer(state, restoreSearchParameters({f}));

      expect(finalState[facetId].numberOfValues).toBe(2);
    });

    it(`when the number of values in the payload is less than the number of values on the request,
    it does not change the request #numberOfValues`, () => {
      const facetId = 'author';
      state[facetId] = buildMockFacetRequest({numberOfValues: 8});

      const f = {[facetId]: ['a']};
      const finalState = facetSetReducer(state, restoreSearchParameters({f}));

      expect(finalState[facetId].numberOfValues).toBe(8);
    });

    it(`when a facet is not found in the #f payload,
    it deselects all values by setting #currentValues to an empty array`, () => {
      const currentValues = [buildMockFacetValueRequest({state: 'selected'})];
      state['author'] = buildMockFacetRequest({currentValues});

      const finalState = facetSetReducer(state, restoreSearchParameters({}));
      expect(finalState['author'].currentValues).toEqual([]);
    });

    it('sets #preventAutoSelect to true on facets with at least one value selected', () => {
      const a = 'a';
      const b = 'b';

      state[a] = buildMockFacetRequest({preventAutoSelect: false});
      state[b] = buildMockFacetRequest({preventAutoSelect: false});
      const f = {[a]: [], [b]: ['foo', 'bar']};

      const finalState = facetSetReducer(state, restoreSearchParameters({f}));
      expect(finalState[a].preventAutoSelect).toBe(false);
      expect(finalState[b].preventAutoSelect).toBe(true);
    });
  });
});
