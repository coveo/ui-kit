import {
  facetSetReducer,
  FacetSetState,
  getFacetSetInitialState,
  buildFacetRequest,
  convertFacetValueToRequest,
} from './facet-set-slice';
import {
  registerFacet,
  FacetOptions,
  toggleSelectFacetValue,
  deselectAllFacetValues,
} from './facet-set-actions';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockSearch} from '../../../test/mock-search';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {executeSearch} from '../../search/search-actions';
import {logGenericSearchEvent} from '../../analytics/analytics-actions';
import {FacetResponse} from './facet-set-interfaces';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request';

describe('facet-set slice', () => {
  let state: FacetSetState;

  function buildOptions(config: Partial<FacetOptions>): FacetOptions {
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
    const options = buildOptions({facetId, field: 'author'});
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

  it('if a facet request is already registered for an id, it does not overwrite the request', () => {
    const id = '1';
    state[id] = buildFacetRequest();

    const options = buildOptions({facetId: id, field: 'author'});
    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);

    expect(finalState[id].field).toBe(state[id].field);
  });

  it('dispatching #toggleSelectFacetValue with a valid facetId sets the state of an idle value to selected', () => {
    const id = '1';

    const facetValue = buildMockFacetValue({value: 'TED'});
    const facetValueRequest = convertFacetValueToRequest(facetValue);

    state[id] = buildFacetRequest({currentValues: [facetValueRequest]});

    const action = toggleSelectFacetValue({facetId: id, selection: facetValue});
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

    state[id] = buildFacetRequest({currentValues: [facetValueRequest]});

    const action = toggleSelectFacetValue({facetId: id, selection: facetValue});
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

    state[id] = buildFacetRequest({currentValues: [facetValueRequest]});

    const action = toggleSelectFacetValue({facetId: id, selection: facetValue});
    const finalState = facetSetReducer(state, action);

    expect(finalState[id].freezeCurrentValues).toBe(true);
  });

  it('dispatching #toggleSelectFacetValue with a valid facetId sets #preventAutoSelect to true on the request', () => {
    const id = '1';

    const facetValue = buildMockFacetValue({value: 'TED'});
    const facetValueRequest = convertFacetValueToRequest(facetValue);

    state[id] = buildFacetRequest({currentValues: [facetValueRequest]});

    const action = toggleSelectFacetValue({facetId: id, selection: facetValue});
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
      const facetValueRequest = buildMockFacetValueRequest({state: 'selected'});
      state[id] = buildFacetRequest({currentValues: [facetValueRequest]});
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

  it('#executeSearch.fulfilled updates the currentValues of facet requests to the values in the response', () => {
    const id = '1';
    const facetValue = buildMockFacetValue({value: 'TED'});
    const facet = buildMockFacetResponse({facetId: id, values: [facetValue]});

    state[id] = buildFacetRequest({facetId: id});

    const action = buildExecuteSearchActionWithFacets([facet]);
    const finalState = facetSetReducer(state, action);

    const expectedFacetValueRequest = convertFacetValueToRequest(facetValue);
    expect(finalState[id].currentValues).toEqual([expectedFacetValueRequest]);
  });

  it('#executeSearch.fulfilled sets #freezeCurrentValues to false', () => {
    const id = '1';
    state[id] = buildFacetRequest({freezeCurrentValues: true});

    const facet = buildMockFacetResponse({facetId: id});
    const action = buildExecuteSearchActionWithFacets([facet]);

    const finalState = facetSetReducer(state, action);
    expect(finalState[id].freezeCurrentValues).toBe(false);
  });

  it('#executeSearch.fulfilled sets #preventAutoSelect to false', () => {
    const id = '1';
    state[id] = buildFacetRequest({preventAutoSelect: true});

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
});
