import {createMockState} from '../../../../test/mock-state';
import {buildFacetRequest} from '../../../../features/facets/facet-set/facet-set-slice';
import {buildFacetSearch} from '../../../../features/facets/facet-search-set/facet-search-set-slice';
import {facetSearchRequestParams} from './facet-search-request';
import {SearchPageState} from '../../../../state';
import {buildMockFacetValueRequest} from '../../../../test/mock-facet-value-request';
import {buildMockSearchRequest} from '../../../../test/mock-search-request';

describe('facetSearchRequestParams', () => {
  const id = '1';
  let state: SearchPageState;

  function setupState() {
    state = createMockState();
    state.facetSet[id] = buildFacetRequest();
    state.facetSearchSet[id] = buildFacetSearch();
  }

  function buildParms() {
    return facetSearchRequestParams(id, state);
  }

  beforeEach(() => setupState());

  it('retrieves the #captions from the facetSearchSet', () => {
    const captions = {a: 'A'};
    state.facetSearchSet[id].options.captions = captions;

    expect(buildParms().captions).toEqual(captions);
  });

  it('retrieves the #numberOfValues from the facetSearchSet', () => {
    const numberOfValues = 5;
    state.facetSearchSet[id].options.numberOfValues = numberOfValues;

    expect(buildParms().numberOfValues).toEqual(numberOfValues);
  });

  it('retrieves the #query from the facetSearchSet', () => {
    const query = 'hello';
    state.facetSearchSet[id].options.query = query;

    expect(buildParms().query).toEqual(query);
  });

  it('retrieves the #field from the facetSet', () => {
    const field = 'author';
    state.facetSet[id].field = field;

    expect(buildParms().field).toBe(field);
  });

  it('retrieves the #delimitingCharacter from the facetSet', () => {
    const char = '|';
    state.facetSet[id].delimitingCharacter = char;

    expect(buildParms().delimitingCharacter).toBe(char);
  });

  it('builds the #ignoreValues from the facetSet non-idle #currentValues', () => {
    const idle = buildMockFacetValueRequest({value: 'A'});
    const selected = buildMockFacetValueRequest({
      value: 'B',
      state: 'selected',
    });
    state.facetSet[id].currentValues = [idle, selected];

    expect(buildParms().ignoreValues).toEqual([selected.value]);
  });

  it('sets the #searchContext to the search request params', () => {
    const facet = state.facetSet[id];
    const request = buildMockSearchRequest({facets: [facet]});

    expect(buildParms().searchContext).toEqual(request);
  });
});
