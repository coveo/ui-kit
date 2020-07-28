import {
  facetSetReducer,
  FacetSetState,
  getFacetSetInitialState,
  convertFacetValueToRequest,
} from './facet-set-slice';
import {getHistoryEmptyState} from '../../history/history-slice';
import {change} from '../../history/history-actions';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
} from './facet-set-actions';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockSearch} from '../../../test/mock-search';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {executeSearch} from '../../search/search-actions';
import {logGenericSearchEvent} from '../../analytics/analytics-actions';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request';
import {selectFacetSearchResult} from '../facet-search-set/facet-search-actions';
import {buildMockFacetSearchResult} from '../../../test/mock-facet-search-result';
import {FacetRegistrationOptions} from './interfaces/options';
import {FacetResponse} from './interfaces/response';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';

describe('facet-set slice', () => {
  let state: FacetSetState;

  function buildRegistrationOptions(
    config: Partial<FacetRegistrationOptions>
  ): FacetRegistrationOptions {
    return {
      facetId: '',
      field: '',
      ...config,
    };
  }

  function buildExecuteSearchActionWithFacets(facets: FacetResponse[]) {
    const search = buildMockSearch();
    search.response.facets = facets;

    return executeSearch.fulfilled(
      search,
      '',
      logGenericSearchEvent({evt: 'foo'})
    );
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
      sortCriteria: 'score',
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
      ...getHistoryEmptyState(),
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
      ...getHistoryEmptyState(),
      facetSet: emptyFacetSet,
    };

    const nextState = facetSetReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual(state);
  });

  it('dispatching #toggleSelectFacetValue with a valid facetId sets the state of an idle value to selected', () => {
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

  it('dispatching #toggleSelectFacetValue with a valid facetId sets the state of a selected value to idle', () => {
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

  it('dispatching #toggleSelectFacetValue with a valid facetId sets #freezeCurrentValues to true on the request', () => {
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

  it('dispatching #toggleSelectFacetValue with a valid facetId sets #preventAutoSelect to true on the request', () => {
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

  it('dispatching #toggleSelectFacetValue with an invalid id does not throw', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    const action = toggleSelectFacetValue({
      facetId: '1',
      selection: facetValue,
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  describe('dispatching #deselectAllFacetValues with a valid id', () => {
    const id = '1';
    let finalState: FacetSetState;

    beforeEach(() => {
      const facetValueRequest = buildMockFacetValueRequest({
        state: 'selected',
      });
      state[id] = buildMockFacetRequest({currentValues: [facetValueRequest]});
      finalState = facetSetReducer(state, deselectAllFacetValues(id));
    });

    it('deselects all facet values on the request', () => {
      finalState[id].currentValues.forEach((fv) =>
        expect(fv.state).toBe('idle')
      );
    });

    it('sets #preventAutoSelect to true on the request', () => {
      expect(finalState[id].preventAutoSelect).toBe(true);
    });
  });

  it('dispatching #deselectAllFacetValues with an invalid id does not throw', () => {
    expect(() =>
      facetSetReducer(state, deselectAllFacetValues('1'))
    ).not.toThrow();
  });

  it('dispatching #updateFacetSortCriterion with a valid id updates the sort criterion to the passed value', () => {
    const id = '1';
    const criterion = 'alphanumeric';

    state[id] = buildMockFacetRequest();

    const action = updateFacetSortCriterion({facetId: id, criterion});
    const finalState = facetSetReducer(state, action);

    expect(finalState[id].sortCriteria).toBe(criterion);
  });

  it('dispatching #updateFacetSortCriterion with an invalid id does not throw', () => {
    const action = updateFacetSortCriterion({
      facetId: '1',
      criterion: 'score',
    });

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it('dispatching #updateFacetNumberOfValues with a registered id updates the number of values', () => {
    const facetId = '1';
    state[facetId] = buildMockFacetRequest();
    const numberOfValues = 20;

    const action = updateFacetNumberOfValues({facetId, numberOfValues});
    const finalState = facetSetReducer(state, action);

    expect(finalState[facetId].numberOfValues).toBe(numberOfValues);
  });

  it('dispatching #updateFacetNumberOfValues with an unregistered id does not throw', () => {
    const action = updateFacetNumberOfValues({
      facetId: '1',
      numberOfValues: 20,
    });
    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  it('#executeSearch.fulfilled updates the currentValues of facet requests to the values in the response', () => {
    const id = '1';
    const facetValue = buildMockFacetValue({value: 'TED'});
    const facet = buildMockFacetResponse({facetId: id, values: [facetValue]});

    state[id] = buildMockFacetRequest({facetId: id});

    const action = buildExecuteSearchActionWithFacets([facet]);
    const finalState = facetSetReducer(state, action);

    const expectedFacetValueRequest = convertFacetValueToRequest(facetValue);
    expect(finalState[id].currentValues).toEqual([expectedFacetValueRequest]);
  });

  it('#executeSearch.fulfilled sets #freezeCurrentValues to false', () => {
    const id = '1';
    state[id] = buildMockFacetRequest({freezeCurrentValues: true});

    const facet = buildMockFacetResponse({facetId: id});
    const action = buildExecuteSearchActionWithFacets([facet]);

    const finalState = facetSetReducer(state, action);
    expect(finalState[id].freezeCurrentValues).toBe(false);
  });

  it('#executeSearch.fulfilled sets #preventAutoSelect to false', () => {
    const id = '1';
    state[id] = buildMockFacetRequest({preventAutoSelect: true});

    const facet = buildMockFacetResponse({facetId: id});
    const action = buildExecuteSearchActionWithFacets([facet]);

    const finalState = facetSetReducer(state, action);
    expect(finalState[id].preventAutoSelect).toBe(false);
  });

  it('#executeSearch.fulfilled response containing unregistered facet ids does not throw', () => {
    const id = '1';
    const facet = buildMockFacetResponse({facetId: id});
    const action = buildExecuteSearchActionWithFacets([facet]);

    expect(() => facetSetReducer(state, action)).not.toThrow();
  });

  describe('when the passed id is registered', () => {
    const facetId = '1';
    const rawValue = 'TED';

    function dispatchSelectFacetSearchResult() {
      const value = buildMockFacetSearchResult({rawValue});
      const action = selectFacetSearchResult({facetId, value});
      state = facetSetReducer(state, action);
    }

    beforeEach(() => {
      state[facetId] = buildMockFacetRequest();
    });

    it('#selectFacetSearchResult adds the #value.rawValue to #currentValues with #state.selected', () => {
      dispatchSelectFacetSearchResult();

      const expectedValue = buildMockFacetValueRequest({
        value: rawValue,
        state: 'selected',
      });

      expect(state[facetId].currentValues).toContainEqual(expectedValue);
    });

    it('when the #value.rawValue already exists, #selectFacetSearchResult does not add a duplicate', () => {
      dispatchSelectFacetSearchResult();
      dispatchSelectFacetSearchResult();

      const values = state[facetId].currentValues.filter(
        (v) => v.value === rawValue
      );
      expect(values.length).toBe(1);
    });
  });

  it('when the passed id is not registered, #selectFacetSearchResult does not throw', () => {
    const value = buildMockFacetSearchResult({rawValue: 'TED'});
    const action = selectFacetSearchResult({facetId: '1', value});
    expect(() => facetSetReducer(state, action)).not.toThrow();
  });
});
