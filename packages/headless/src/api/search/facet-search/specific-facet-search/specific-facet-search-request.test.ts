import {createMockState} from '../../../../test/mock-state';
import {buildMockFacetValueRequest} from '../../../../test/mock-facet-value-request';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {SearchAppState} from '../../../../state/search-app-state';
import {buildSpecificFacetSearchRequest} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-request-builder';
import {buildSearchRequest} from '../../../../features/search/search-actions';

describe('#buildSpecificFacetSearchRequest', () => {
  const id = '1';
  let state: SearchAppState;

  function setupState() {
    state = createMockState();
    state.facetSet[id] = buildMockFacetRequest();
    state.facetSearchSet[id] = buildMockFacetSearch();
  }

  function buildParams() {
    return buildSpecificFacetSearchRequest(id, state);
  }

  beforeEach(() => setupState());

  it('retrieves the #captions from the facetSearchSet', () => {
    const captions = {a: 'A'};
    state.facetSearchSet[id].options.captions = captions;

    expect(buildParams().captions).toEqual(captions);
  });

  it('retrieves the #numberOfValues from the facetSearchSet', () => {
    const numberOfValues = 5;
    state.facetSearchSet[id].options.numberOfValues = numberOfValues;

    expect(buildParams().numberOfValues).toEqual(numberOfValues);
  });

  it('retrieves the #query from the facetSearchSet', () => {
    const query = 'hello';
    state.facetSearchSet[id].options.query = query;

    expect(buildParams().query).toEqual(`*${query}*`);
  });

  it('retrieves the #field from the facetSet', () => {
    const field = 'author';
    state.facetSet[id].field = field;

    expect(buildParams().field).toBe(field);
  });

  it('retrieves the #delimitingCharacter from the facetSet', () => {
    const char = '|';
    state.facetSet[id].delimitingCharacter = char;

    expect(buildParams().delimitingCharacter).toBe(char);
  });

  it('builds the #ignoreValues from the facetSet non-idle #currentValues', () => {
    const idle = buildMockFacetValueRequest({value: 'A'});
    const selected = buildMockFacetValueRequest({
      value: 'B',
      state: 'selected',
    });
    state.facetSet[id].currentValues = [idle, selected];

    expect(buildParams().ignoreValues).toEqual([selected.value]);
  });

  it('sets the #searchContext to the search request params', () => {
    const facet = state.facetSet[id];
    const request = {...buildSearchRequest(state), facets: [facet]};

    expect(buildParams().searchContext).toEqual({
      ...request,
      visitorId: expect.any(String),
    });
  });
});
