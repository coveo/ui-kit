import {createMockState} from '../../test/mock-state';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockFacetOptions} from '../../test/mock-facet-options';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {SearchAppState} from '../../state/search-app-state';
import {buildSearchRequest} from './search-request-builder';

describe('search request', () => {
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#searchRequest returns the state #query', () => {
    state.query.q = 'hello';
    const params = buildSearchRequest(state);

    expect(params.q).toBe(state.query.q);
  });

  it('#searchRequest returns the state #enableQuerySyntax', () => {
    state.query.enableQuerySyntax = true;
    const params = buildSearchRequest(state);

    expect(params.enableQuerySyntax).toBe(state.query.enableQuerySyntax);
  });

  it('#searchRequest returns the state #sortCriteria', () => {
    state.sortCriteria = 'qre';
    const params = buildSearchRequest(state);

    expect(params.sortCriteria).toBe(state.sortCriteria);
  });

  it('#searchRequest returns the state #numberOfResults', () => {
    state.pagination.numberOfResults = 10;
    const params = buildSearchRequest(state);

    expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
  });

  it('#searchRequest returns the state #firstResult', () => {
    state.pagination.firstResult = 10;
    const params = buildSearchRequest(state);

    expect(params.firstResult).toBe(state.pagination.firstResult);
  });

  it('#searchRequest returns the facets in the state #facetSet', () => {
    const request = buildMockFacetRequest({field: 'objecttype'});
    state.facetSet[1] = request;

    const {facets} = buildSearchRequest(state);
    expect(facets).toContain(request);
  });

  it('#searchRequest returns the facets in the state #numericFacetSet', () => {
    const request = buildMockNumericFacetRequest({field: 'objecttype'});
    state.numericFacetSet[1] = request;

    const {facets} = buildSearchRequest(state);
    expect(facets).toContain(request);
  });

  it('#searchRequest returns the facets in the state #dateFacetSet', () => {
    const request = buildMockDateFacetRequest({field: 'objecttype'});
    state.dateFacetSet[1] = request;

    const {facets} = buildSearchRequest(state);
    expect(facets).toContain(request);
  });

  it('#searchRequestParams returns the facets in the #categoryFacetSet', () => {
    const request = buildMockCategoryFacetRequest({field: 'objecttype'});
    state.categoryFacetSet[1] = request;

    const {facets} = buildSearchRequest(state);
    expect(facets).toContain(request);
  });

  it(`when there are facets in the response,
  #searchRequestParams orders the facets in the same order as the response`, () => {
    const facetId1 = '1';
    const facetId2 = '2';

    state.search.response.facets = [
      buildMockFacetResponse({facetId: facetId2}),
      buildMockFacetResponse({facetId: facetId1}),
    ];

    state.facetSet[facetId1] = buildMockFacetRequest({facetId: facetId1});
    state.facetSet[facetId2] = buildMockFacetRequest({facetId: facetId2});

    const {facets} = buildSearchRequest(state);
    expect(facets).toEqual([
      state.facetSet[facetId2],
      state.facetSet[facetId1],
    ]);
  });

  it(`when there is a facet request that is not in the response,
  #searchRequestParams includes it at the end of the facets array`, () => {
    const facetId1 = '1';
    const facetId2 = '2';

    state.search.response.facets = [
      buildMockFacetResponse({facetId: facetId2}),
    ];

    state.facetSet[facetId1] = buildMockFacetRequest({facetId: facetId1});
    state.facetSet[facetId2] = buildMockFacetRequest({facetId: facetId2});

    const {facets} = buildSearchRequest(state);
    expect(facets).toEqual([
      state.facetSet[facetId2],
      state.facetSet[facetId1],
    ]);
  });

  it('#searchRequestParams returns the facetOptions in state', () => {
    state.facetOptions = buildMockFacetOptions({freezeFacetOrder: true});

    const params = buildSearchRequest(state);
    expect(params.facetOptions).toEqual(state.facetOptions);
  });

  it('should send visitorId if analytics is enable', () => {
    state.configuration.analytics.enabled = true;
    expect(buildSearchRequest(state).visitorId).toBeDefined();
  });

  it('should not send visitorId if analytics is disabled', () => {
    state.configuration.analytics.enabled = false;
    expect(buildSearchRequest(state).visitorId).not.toBeDefined();
  });
});
