import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequest} from './plan/plan-request';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request';
import {SearchRequest} from './search/search-request';
import {createMockState} from '../../test/mock-state';
import {createMockRecommendationState} from '../../test/mock-recommendation-state';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {getOrganizationIdQueryParam} from './search-api-params';
import {buildMockFacetSearch} from '../../test/mock-facet-search';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockCategoryFacetSearch} from '../../test/mock-category-facet-search';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {SearchAppState} from '../../state/search-app-state';
import {buildPlanRequest} from '../../features/redirection/redirection-actions';
import {buildQuerySuggestRequest} from '../../features/query-suggest/query-suggest-actions';
import {buildSearchRequest} from '../../features/search/search-actions';
import {buildSpecificFacetSearchRequest} from '../../features/facets/facet-search-set/specific/specific-facet-search-request-builder';
import {buildCategoryFacetSearchRequest} from '../../features/facets/facet-search-set/category/category-facet-search-request-builder';
import {buildRecommendationRequest} from '../../features/recommendation/recommendation-actions';
import {RecommendationRequest} from './recommendation/recommendation-request';
import {buildProductRecommendationsRequest} from '../../features/product-recommendations/product-recommendations-actions';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {ProductRecommendationsRequest} from './product-recommendations/product-recommendations-request';

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
    const req = buildSearchRequest(state);
    searchAPIClient.search(req);

    const expectedRequest: PlatformClientCallOptions<SearchRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }?${getOrganizationIdQueryParam(req)}`,
      renewAccessToken,
      requestParams: {
        q: state.query.q,
        cq: '',
        aq: '',
        numberOfResults: state.pagination.numberOfResults,
        sortCriteria: state.sortCriteria,
        firstResult: state.pagination.firstResult,
        facets: [],
        facetOptions: state.facetOptions,
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
    const req = buildPlanRequest(state);
    searchAPIClient.plan(req);

    const expectedRequest: PlatformClientCallOptions<PlanRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/plan?${getOrganizationIdQueryParam(req)}`,
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

    const req = buildQuerySuggestRequest(id, state);
    searchAPIClient.querySuggest(req);

    const expectedRequest: PlatformClientCallOptions<QuerySuggestRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/querySuggest?${getOrganizationIdQueryParam(req)}`,
      renewAccessToken,
      requestParams: {
        q: state.querySuggest[id]!.q,
        count: state.querySuggest[id]!.count,
        context: state.context.contextValues,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
        actionsHistory: expect.any(Array),
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

      const req = buildSpecificFacetSearchRequest(id, state);
      searchAPIClient.facetSearch(req);

      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      expect(request).toMatchObject({
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl
        }/facet?${getOrganizationIdQueryParam(req)}`,
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
      const req = buildSpecificFacetSearchRequest(id, state);

      searchAPIClient.facetSearch(req);

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
            ...buildSearchRequest(state),
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

      const req = buildCategoryFacetSearchRequest(id, state);

      searchAPIClient.facetSearch(req);

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
            ...buildSearchRequest(state),
            visitorId: expect.any(String),
          },
        },
      });
    });

    it(`when calling SearchAPIClient.recommendations
  should call PlatformClient.call with the right options`, () => {
      const recommendationState = createMockRecommendationState();
      const req = buildRecommendationRequest(recommendationState);

      searchAPIClient.recommendations(req);

      const expectedRequest: PlatformClientCallOptions<RecommendationRequest> = {
        accessToken: recommendationState.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          recommendationState.configuration.search.apiBaseUrl
        }?${getOrganizationIdQueryParam(req)}`,
        renewAccessToken,
        requestParams: {
          recommendation: recommendationState.recommendation.id,
          aq: recommendationState.advancedSearchQueries.aq,
          cq: recommendationState.advancedSearchQueries.cq,
          fieldsToInclude: recommendationState.fields.fieldsToInclude,
          context: recommendationState.context.contextValues,
          pipeline: recommendationState.pipeline,
          searchHub: recommendationState.searchHub,
          actionsHistory: expect.any(Array),
        },
      };

      expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
    });

    it(`when calling SearchAPIClient.productRecommendations
  should call PlatformClient.call with the right options`, () => {
      const productRecommendationsState = buildMockProductRecommendationsState();
      const req = buildProductRecommendationsRequest(
        productRecommendationsState
      );

      searchAPIClient.productRecommendations(req);

      const expectedRequest: PlatformClientCallOptions<ProductRecommendationsRequest> = {
        accessToken: productRecommendationsState.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          productRecommendationsState.configuration.search.apiBaseUrl
        }?${getOrganizationIdQueryParam(req)}`,
        renewAccessToken,
        requestParams: {
          recommendation: productRecommendationsState.productRecommendations.id,
          context: productRecommendationsState.context.contextValues,
          searchHub: productRecommendationsState.searchHub,
          actionsHistory: expect.any(Array),
          maximumAge: 0,
          visitorId: expect.any(String),
          numberOfResults:
            productRecommendationsState.productRecommendations
              .maxNumberOfRecommendations,
          mlParameters: {
            itemIds: productRecommendationsState.productRecommendations.skus,
          },
        },
      };

      expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
    });
  });
});
