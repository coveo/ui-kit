import {
  isErrorResponse,
  SearchAPIClient,
  SearchAPIClientOptions,
} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
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
import {buildSpecificFacetSearchRequest} from '../../features/facets/facet-search-set/specific/specific-facet-search-request-builder';
import {buildCategoryFacetSearchRequest} from '../../features/facets/facet-search-set/category/category-facet-search-request-builder';
import {buildRecommendationRequest} from '../../features/recommendation/recommendation-actions';
import {buildProductRecommendationsRequest} from '../../features/product-recommendations/product-recommendations-actions';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {getProductRecommendationsInitialState} from '../../features/product-recommendations/product-recommendations-state';
import pino from 'pino';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockQuerySuggestCompletion} from '../../test/mock-query-suggest-completion';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice';
import {buildSearchRequest} from '../../features/search/search-actions';
import {buildMockSearchAPIClient} from '../../test/mock-search-api-client';
import {NoopPreprocessRequest} from '../preprocess-request';
import {Response} from 'cross-fetch';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {SearchResponseSuccess} from './search/search-response';
import {emptyQuestionAnswer} from '../../features/search/search-state';
import {QuestionsAnswers} from './search/question-answering';

jest.mock('../platform-client');
describe('search api client', () => {
  const logger = pino({level: 'silent'});
  let searchAPIClient: SearchAPIClient;
  let state: SearchAppState;

  function buildSearchAPIClient(options?: Partial<SearchAPIClientOptions>) {
    searchAPIClient = buildMockSearchAPIClient({
      logger,
      ...options,
    });

    mockPlatformResponse(() => buildMockSearchEndpointResponse());
  }

  function mockPlatformResponse(buildResponse: () => Response, times = 1) {
    const mock = jest.fn();
    let count = times;

    while (count > 0) {
      mock.mockReturnValueOnce(buildResponse());
      count--;
    }

    PlatformClient.call = mock;
  }

  function buildMockSearchEndpointResponse() {
    const body = JSON.stringify(buildMockSearchResponse());
    return new Response(body);
  }

  beforeEach(() => {
    state = createMockState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('middleware', () => {
    it('should preprocess search responses if appropriate middleware is provided', async () => {
      const newId = 'notInitialID';
      buildSearchAPIClient({
        postprocessSearchResponseMiddleware: (response) => {
          return {
            ...response,
            body: {
              ...response.body,
              searchUid: newId,
            },
          };
        },
      });
      const req = buildSearchRequest(state).request;
      const res = await searchAPIClient.search(req);
      if (!isErrorResponse(res)) {
        expect(res.success.searchUid).toEqual(newId);
      }
    });

    it('should preprocess query suggest responses if appropriate middleware is provided', async () => {
      state = createMockState({
        querySuggest: {
          test: buildMockQuerySuggest(),
        },
      });

      const completions = [
        buildMockQuerySuggestCompletion({expression: 'hello world'}),
      ];
      buildSearchAPIClient({
        postprocessQuerySuggestResponseMiddleware: (response) => {
          return {
            ...response,
            body: {
              ...response.body,
              completions,
            },
          };
        },
      });
      const req = buildQuerySuggestRequest('test', state);
      const res = await searchAPIClient.querySuggest(req);
      if (!isErrorResponse(res)) {
        expect(res.success.completions).toEqual(completions);
      }
    });

    it('should preprocess search responses if appropriate middleware is provided', async () => {
      state = createMockState({
        facetSearchSet: {
          test: buildMockFacetSearch(),
        },
        facetSet: {
          test: buildMockFacetRequest(),
        },
      });

      buildSearchAPIClient({
        postprocessFacetSearchResponseMiddleware: (response) => {
          return {
            ...response,
            body: {
              ...response.body,
              moreValuesAvailable: true,
            },
          };
        },
      });
      const req = buildSpecificFacetSearchRequest('test', state);
      const res = await searchAPIClient.facetSearch(req);
      expect(res.moreValuesAvailable).toEqual(true);
    });
  });

  describe('noop middleware', () => {
    beforeEach(() => {
      buildSearchAPIClient();
    });

    it(`when calling SearchAPIClient.search
    should call PlatformClient.call with the right options`, () => {
      const req = buildSearchRequest(state).request;
      searchAPIClient.search(req);
      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions = {
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl
        }?${getOrganizationIdQueryParam(req)}`,
        logger,
        requestParams: {
          q: state.query.q,
          cq: '',
          aq: '',
          debug: false,
          locale: state.configuration.search.locale,
          timezone: state.configuration.search.timezone,
          numberOfResults: state.pagination.numberOfResults,
          sortCriteria: state.sortCriteria,
          firstResult: state.pagination.firstResult,
          facetOptions: state.facetOptions,
          context: state.context.contextValues,
          enableDidYouMean: state.didYouMean.enableDidYouMean,
          enableQuerySyntax: state.query.enableQuerySyntax,
          fieldsToInclude: state.fields.fieldsToInclude,
          pipeline: state.pipeline,
          searchHub: state.searchHub,
          visitorId: expect.any(String),
        },
        preprocessRequest: NoopPreprocessRequest,
      };

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.search multiple times
    should abort the previous pending requests`, () => {
      mockPlatformResponse(() => buildMockSearchEndpointResponse(), 3);
      const req = buildSearchRequest(state).request;
      searchAPIClient.search(req);
      searchAPIClient.search(req);
      searchAPIClient.search(req);
      const firstRequest = (PlatformClient.call as jest.Mock).mock.calls[0][0];
      const secondRequest = (PlatformClient.call as jest.Mock).mock.calls[1][0];
      const thirdRequest = (PlatformClient.call as jest.Mock).mock.calls[2][0];
      expect(firstRequest.signal.aborted).toBe(true);
      expect(secondRequest.signal.aborted).toBe(true);
      expect(thirdRequest.signal.aborted).toBe(false);
    });

    it(`when calling SearchAPIClient.plan
    should call PlatformClient.call with the right options`, () => {
      const req = buildPlanRequest(state);
      searchAPIClient.plan(req);
      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions = {
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl
        }/plan?${getOrganizationIdQueryParam(req)}`,
        logger,
        requestParams: {
          q: state.query.q,
          context: state.context.contextValues,
          pipeline: state.pipeline,
          searchHub: state.searchHub,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
        },
        preprocessRequest: NoopPreprocessRequest,
      };

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.querySuggest
    should call PlatformClient.call with the right options`, () => {
      const id = 'someid123';
      const qs = buildMockQuerySuggest({id, q: 'some query', count: 11});
      state.querySuggest[id] = qs;

      const req = buildQuerySuggestRequest(id, state);
      searchAPIClient.querySuggest(req);
      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions = {
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl
        }/querySuggest?${getOrganizationIdQueryParam(req)}`,
        logger,
        requestParams: {
          q: state.querySuggest[id]!.q,
          count: state.querySuggest[id]!.count,
          context: state.context.contextValues,
          pipeline: state.pipeline,
          searchHub: state.searchHub,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
          actionsHistory: expect.any(Array),
        },
        preprocessRequest: NoopPreprocessRequest,
      };

      expect(request).toMatchObject(expectedRequest);
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

        const {query} = facetSearchState.options;
        const newQuery = `*${query}*`;

        expect(request).toMatchObject({
          requestParams: {
            type: 'specific',
            captions: facetSearchState.options.captions,
            numberOfValues: facetSearchState.options.numberOfValues,
            query: newQuery,
            field: facetState.field,
            delimitingCharacter: facetState.delimitingCharacter,
            ignoreValues: [],
            searchContext: {
              ...buildSearchRequest(state).request,
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
        state.categoryFacetSet[id] = buildMockCategoryFacetSlice({
          request: categoryFacet,
        });

        const req = buildCategoryFacetSearchRequest(id, state);

        searchAPIClient.facetSearch(req);

        const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

        const {query} = categoryFacetSearch.options;
        const newQuery = `*${query}*`;

        expect(request).toMatchObject({
          requestParams: {
            type: 'hierarchical',
            basePath: categoryFacet.basePath,
            captions: categoryFacetSearch.options.captions,
            numberOfValues: categoryFacetSearch.options.numberOfValues,
            query: newQuery,
            field: categoryFacet.field,
            delimitingCharacter: categoryFacet.delimitingCharacter,
            ignorePaths: [],
            searchContext: {
              ...buildSearchRequest(state).request,
              visitorId: expect.any(String),
            },
          },
        });
      });
    });

    it(`when calling SearchAPIClient.recommendations
      should call PlatformClient.call with the right options`, () => {
      const originLevel2 = 'tab';
      const originLevel3 = 'referrer';
      const analytics = buildMockAnalyticsState({
        originLevel2,
        originLevel3,
      });

      const recommendationState = createMockRecommendationState();
      recommendationState.configuration.analytics = analytics;

      const req = buildRecommendationRequest(recommendationState);

      searchAPIClient.recommendations(req);

      const expectedRequest: PlatformClientCallOptions = {
        accessToken: recommendationState.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          recommendationState.configuration.search.apiBaseUrl
        }?${getOrganizationIdQueryParam(req)}`,
        logger,
        requestParams: {
          recommendation: recommendationState.recommendation.id,
          aq: recommendationState.advancedSearchQueries.aq,
          cq: recommendationState.advancedSearchQueries.cq,
          fieldsToInclude: recommendationState.fields.fieldsToInclude,
          context: recommendationState.context.contextValues,
          pipeline: recommendationState.pipeline,
          searchHub: recommendationState.searchHub,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
          actionsHistory: expect.any(Array),
          tab: originLevel2,
          referrer: originLevel3,
        },
        preprocessRequest: NoopPreprocessRequest,
      };
      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.productRecommendations
      should call PlatformClient.call with the right options`, () => {
      const productRecommendationsState = buildMockProductRecommendationsState({
        productRecommendations: {
          ...getProductRecommendationsInitialState(),
          skus: ['one'],
          maxNumberOfRecommendations: 10,
          filter: {
            brand: 'somebrand',
            category: 'somecategory',
          },
        },
      });
      const req = buildProductRecommendationsRequest(
        productRecommendationsState
      );

      searchAPIClient.productRecommendations(req);
      const request = (PlatformClient.call as jest.Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions = {
        accessToken: productRecommendationsState.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          productRecommendationsState.configuration.search.apiBaseUrl
        }?${getOrganizationIdQueryParam(req)}`,
        logger,
        requestParams: {
          recommendation: productRecommendationsState.productRecommendations.id,
          context: productRecommendationsState.context.contextValues,
          searchHub: productRecommendationsState.searchHub,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
          actionsHistory: expect.any(Array),
          visitorId: expect.any(String),
          numberOfResults:
            productRecommendationsState.productRecommendations
              .maxNumberOfRecommendations,
          mlParameters: {
            itemIds: productRecommendationsState.productRecommendations.skus,
            brandFilter:
              productRecommendationsState.productRecommendations.filter.brand,
            categoryFilter:
              productRecommendationsState.productRecommendations.filter
                .category,
          },
        },
        preprocessRequest: NoopPreprocessRequest,
      };

      expect(request).toMatchObject(expectedRequest);
    });

    describe('SearchAPIClient.html', () => {
      function encodeUTF16(str: string) {
        const buf = new ArrayBuffer(str.length * 2);
        const bufView = new Uint16Array(buf);

        for (let i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }

        return bufView;
      }

      it('when the response is UTF-16 encoded, it decodes the response correctly', async () => {
        const payload = encodeUTF16('hello');
        const headers = {'content-type': 'text/html; charset=UTF-16'};
        const response = new Response(payload, {headers});
        PlatformClient.call = () => Promise.resolve(response);

        const req = buildResultPreviewRequest(state, {uniqueId: '1'});
        const res = await searchAPIClient.html(req);

        expect(res.success).toBe('hello');
      });
    });
  });

  describe('SearchAPIClient.search question answering', () => {
    const doMockPlatformResponseAndAssertSuccess = async (
      mockResponse: SearchResponseSuccess
    ) => {
      const body = JSON.stringify(mockResponse);
      const response = new Response(body);

      PlatformClient.call = () => Promise.resolve(response);
      const res = await searchAPIClient.search(
        buildSearchRequest(state).request
      );
      if (isErrorResponse(res)) {
        fail(
          'SearchAPIClient should not return an error when processing question answering'
        );
      }
      return res.success;
    };

    it('should shim the content of #questionAnswer if not available', async () => {
      const mockResponse = buildMockSearchResponse();
      delete (mockResponse as Partial<SearchResponseSuccess>).questionAnswer;

      const res = await doMockPlatformResponseAndAssertSuccess(mockResponse);
      expect(res.questionAnswer).toMatchObject(emptyQuestionAnswer());
    });

    it('should shim the content of #questionAnswer if partially available', async () => {
      const mockResponse = buildMockSearchResponse();
      mockResponse.questionAnswer.question = 'foo';
      mockResponse.questionAnswer.answerSnippet = 'bar';
      delete (mockResponse.questionAnswer as Partial<QuestionsAnswers>)
        .documentId;
      delete (mockResponse.questionAnswer as Partial<QuestionsAnswers>)
        .relatedQuestions;

      const res = await doMockPlatformResponseAndAssertSuccess(mockResponse);
      expect(res.questionAnswer.question).toBe('foo');
      expect(res.questionAnswer.answerSnippet).toBe('bar');
      expect(res.questionAnswer.documentId).toMatchObject({
        ...emptyQuestionAnswer().documentId,
      });
      expect(res.questionAnswer.relatedQuestions).toBeDefined();
      expect(res.questionAnswer.relatedQuestions.length).toEqual(
        emptyQuestionAnswer().relatedQuestions.length
      );
    });
  });
});
