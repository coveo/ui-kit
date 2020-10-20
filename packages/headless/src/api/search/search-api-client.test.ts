import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequest} from './plan/plan-request';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request';
import {SearchRequest, searchRequest} from './search/search-request';
import {createMockState} from '../../test/mock-state';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {getOrganizationIdQueryParam} from './search-api-params';
import {buildMockFacetSearch} from '../../test/mock-facet-search';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockCategoryFacetSearch} from '../../test/mock-category-facet-search';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {SearchAppState} from '../../state/search-app-state';

jest.mock('../platform-client');
describe('search api client', () => {
  const renewAccessToken = async () => 'newToken';
  let searchAPIClient: SearchAPIClient;
  let state: SearchAppState;

  beforeEach(() => {
    searchAPIClient = new SearchAPIClient(renewAccessToken);
    state = createMockState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when calling SearchAPIClient.search
  should call PlatformClient.call with the right options`, () => {
    searchAPIClient.search(state);

    const expectedRequest: PlatformClientCallOptions<SearchRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }?${getOrganizationIdQueryParam(state)}`,
      renewAccessToken,
      requestParams: {
        q: state.query.q,
        cq: '',
        aq: '',
        numberOfResults: state.pagination.numberOfResults,
        sortCriteria: state.sortCriteria,
        firstResult: state.pagination.firstResult,
        facets: [],
        context: state.context.contextValues,
        enableDidYouMean: state.didYouMean.enableDidYouMean,
        fieldsToInclude: state.fields.fieldsToInclude,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
        visitorId: expect.any(String),
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });

  it(`when calling SearchAPIClient.plan
  should call PlatformClient.call with the right options`, () => {
    searchAPIClient.plan(state);

    const expectedRequest: PlatformClientCallOptions<PlanRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/plan?${getOrganizationIdQueryParam(state)}`,
      renewAccessToken,
      requestParams: {
        q: state.query.q,
        context: state.context.contextValues,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });

  it(`when calling SearchAPIClient.querySuggest
  should call PlatformClient.call with the right options`, () => {
    const id = 'someid123';
    const qs = buildMockQuerySuggest({id, q: 'some query', count: 11});
    state.querySuggest[id] = qs;

    searchAPIClient.querySuggest(id, state);

    const expectedRequest: PlatformClientCallOptions<QuerySuggestRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/querySuggest?${getOrganizationIdQueryParam(state)}`,
      renewAccessToken,
      requestParams: {
        q: state.querySuggest[id]!.q,
        count: state.querySuggest[id]!.count,
        context: state.context.contextValues,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });

  describe('SearchAPIClient.facetSearch', () => {
    it('it calls Platform.call with the right options', () => {
      const id = 'someid123';
      const facetSearchState = buildMockFacetSearch();
      const facetState = buildMockFacetRequest();

      state.facetSearchSet[id] = facetSearchState;
      state.facetSet[id] = facetState;

      searchAPIClient.facetSearch(id, state);

      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      expect(request).toMatchObject({
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl
        }/facet?${getOrganizationIdQueryParam(state)}`,
        renewAccessToken,
      });
    });

    it(`when the id is on the facetSearchSet,
    it calls PlatformClient.call with the facet search params`, () => {
      const id = 'someid123';
      const facetSearchState = buildMockFacetSearch();
      const facetState = buildMockFacetRequest();

      state.facetSearchSet[id] = facetSearchState;
      state.facetSet[id] = facetState;

      searchAPIClient.facetSearch(id, state);

      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      expect(request).toMatchObject({
        requestParams: {
          type: 'specific',
          captions: facetSearchState.options.captions,
          numberOfValues: facetSearchState.options.numberOfValues,
          query: facetSearchState.options.query,
          field: facetState.field,
          delimitingCharacter: facetState.delimitingCharacter,
          ignoreValues: [],
          searchContext: {
            ...searchRequest(state),
            visitorId: expect.any(String),
          },
        },
      });
    });

    it(`when the id is on the categoryFacetSearchSet,
    it calls PlatformClient.call with the category facet search params`, () => {
      const id = '1';
      const categoryFacetSearch = buildMockCategoryFacetSearch();
      const categoryFacet = buildMockCategoryFacetRequest();

      state.categoryFacetSearchSet[id] = categoryFacetSearch;
      state.categoryFacetSet[id] = categoryFacet;

      searchAPIClient.facetSearch(id, state);

      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      expect(request).toMatchObject({
        requestParams: {
          type: 'hierarchical',
          basePath: categoryFacet.basePath,
          captions: categoryFacetSearch.options.captions,
          numberOfValues: categoryFacetSearch.options.numberOfValues,
          query: categoryFacetSearch.options.query,
          field: categoryFacet.field,
          delimitingCharacter: categoryFacet.delimitingCharacter,
          ignorePaths: [],
          searchContext: {
            ...searchRequest(state),
            visitorId: expect.any(String),
          },
        },
      });
    });
  });
});
