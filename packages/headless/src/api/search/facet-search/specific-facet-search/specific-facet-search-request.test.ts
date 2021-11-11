import {createMockState} from '../../../../test/mock-state';
import {buildMockFacetValueRequest} from '../../../../test/mock-facet-value-request';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search';
import {SearchAppState} from '../../../../state/search-app-state';
import {buildSpecificFacetSearchRequest} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-request-builder';
import {buildSearchRequest} from '../../../../features/search/search-request';

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

  it('retrieves the #captions from the facetSearchSet', async () => {
    const captions = {a: 'A'};
    state.facetSearchSet[id].options.captions = captions;

    expect((await buildParams()).captions).toEqual(captions);
  });

  it('retrieves the #numberOfValues from the facetSearchSet', async () => {
    const numberOfValues = 5;
    state.facetSearchSet[id].options.numberOfValues = numberOfValues;

    expect((await buildParams()).numberOfValues).toEqual(numberOfValues);
  });

  it('retrieves the #query from the facetSearchSet', async () => {
    const query = 'hello';
    state.facetSearchSet[id].options.query = query;

    expect((await buildParams()).query).toEqual(`*${query}*`);
  });

  it('retrieves the #field from the facetSet', async () => {
    const field = 'author';
    state.facetSet[id].field = field;

    expect((await buildParams()).field).toBe(field);
  });

  it('builds the #ignoreValues from the facetSet non-idle #currentValues', async () => {
    const idle = buildMockFacetValueRequest({value: 'A'});
    const selected = buildMockFacetValueRequest({
      value: 'B',
      state: 'selected',
    });
    state.facetSet[id].currentValues = [idle, selected];

    expect((await buildParams()).ignoreValues).toEqual([selected.value]);
  });

  it('sets the #searchContext to the search request params', async () => {
    const facet = state.facetSet[id];
    const request = {
      ...(await buildSearchRequest(state)).request,
      facets: [facet],
    };

    expect((await buildParams()).searchContext).toEqual({
      ...request,
      visitorId: expect.any(String),
    });
  });
});
