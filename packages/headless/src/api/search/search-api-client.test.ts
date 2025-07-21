import {pino} from 'pino';
import type {Mock} from 'vitest';
import {buildCategoryFacetSearchRequest} from '../../features/facets/facet-search-set/category/category-facet-search-request-builder.js';
import {buildSpecificFacetSearchRequest} from '../../features/facets/facet-search-set/specific/specific-facet-search-request-builder.js';
import {buildQuerySuggestRequest} from '../../features/query-suggest/query-suggest-actions.js';
import {buildRecommendationRequest} from '../../features/recommendation/recommendation-actions.js';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder.js';
import {buildSearchRequest} from '../../features/search/search-request.js';
import {emptyQuestionAnswer} from '../../features/search/search-state.js';
import {buildPlanRequest} from '../../features/standalone-search-box-set/standalone-search-box-set-actions.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state.js';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetSearch} from '../../test/mock-category-facet-search.js';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice.js';
import {buildMockFacetSearch} from '../../test/mock-facet-search.js';
import {buildMockFacetSlice} from '../../test/mock-facet-slice.js';
import {buildMockNavigatorContextProvider} from '../../test/mock-navigator-context-provider.js';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest.js';
import {buildMockQuerySuggestCompletion} from '../../test/mock-query-suggest-completion.js';
import {createMockRecommendationState} from '../../test/mock-recommendation-state.js';
import {buildMockSearchAPIClient} from '../../test/mock-search-api-client.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {createMockState} from '../../test/mock-state.js';
import {
  getSearchApiBaseUrl,
  PlatformClient,
  type PlatformClientCallOptions,
} from '../platform-client.js';
import {NoopPreprocessRequest} from '../preprocess-request.js';
import type {FacetSearchRequest} from './facet-search/facet-search-request.js';
import type {HtmlRequest} from './html/html-request.js';
import type {PlanRequest} from './plan/plan-request.js';
import type {QuerySuggestRequest} from './query-suggest/query-suggest-request.js';
import type {RecommendationRequest} from './recommendation/recommendation-request.js';
import type {QuestionsAnswers} from './search/question-answering.js';
import type {SearchRequest} from './search/search-request.js';
import type {SearchResponseSuccess} from './search/search-response.js';
import {
  isErrorResponse,
  type SearchAPIClient,
  type SearchAPIClientOptions,
} from './search-api-client.js';
import {
  getAuthenticationQueryParam,
  getOrganizationIdQueryParam,
} from './search-api-params.js';

vi.mock('../platform-client');

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
    const mock = vi.fn();
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

  function getPlatformClientCalls() {
    return (PlatformClient.call as Mock).mock.calls.map(
      (call) => call[0] as PlatformClientCallOptions
    );
  }

  beforeEach(() => {
    state = createMockState();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      const req = (
        await buildSearchRequest(state, buildMockNavigatorContextProvider()())
      ).request;
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
      const req = await buildQuerySuggestRequest(
        'test',
        state,
        buildMockNavigatorContextProvider()()
      );
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
          test: buildMockFacetSlice(),
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
      const req = await buildSpecificFacetSearchRequest(
        'test',
        state,
        buildMockNavigatorContextProvider()(),
        false
      );
      const res = await searchAPIClient.facetSearch(req);
      expect(res.moreValuesAvailable).toEqual(true);
    });

    describe('when calling SearchAPIClient.recommendations', () => {
      it('should preprocess the response', async () => {
        const recommendationState = createMockRecommendationState();
        const processedRecommendations = buildMockSearchResponse();

        buildSearchAPIClient({
          postprocessSearchResponseMiddleware: (response) => {
            return {
              ...response,
              body: processedRecommendations,
            };
          },
        });

        const req = await buildRecommendationRequest(recommendationState);
        const res = await searchAPIClient.recommendations(req);

        if (!isErrorResponse(res)) {
          expect(res.success).toEqual(processedRecommendations);
        }
      });
    });
  });

  describe('noop middleware', () => {
    beforeEach(() => {
      state.pipeline = 'some-pipeline';
      buildSearchAPIClient();
    });

    it(`when calling SearchAPIClient.search
    should call PlatformClient.call with the right options`, async () => {
      const navigatorContextProvier = buildMockNavigatorContextProvider({
        referrer: 'example.com',
      });
      const req = (await buildSearchRequest(state, navigatorContextProvier()))
        .request;
      searchAPIClient.search(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions<
        Omit<SearchRequest, 'accessToken' | 'organizationId' | 'url'>
      > = {
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl ??
          getSearchApiBaseUrl(
            state.configuration.organizationId,
            state.configuration.environment
          )
        }?${getOrganizationIdQueryParam(req)}`,
        logger,
        origin: 'searchApiFetch',
        requestParams: {
          referrer: navigatorContextProvier().referrer,
          tab: state.configuration.analytics.originLevel2,
          q: state.query.q,
          debug: false,
          locale: state.configuration.search.locale,
          timezone: state.configuration.search.timezone,
          numberOfResults: state.pagination.numberOfResults,
          sortCriteria: state.sortCriteria,
          firstResult: state.pagination.firstResult,
          facetOptions: {freezeFacetOrder: state.facetOptions.freezeFacetOrder},
          context: state.context.contextValues,
          enableDidYouMean: state.didYouMean.enableDidYouMean,
          enableQuerySyntax: state.query.enableQuerySyntax,
          fieldsToInclude: state.fields.fieldsToInclude,
          pipeline: state.pipeline,
          searchHub: state.searchHub,
        },
        preprocessRequest: NoopPreprocessRequest,
        requestMetadata: {method: 'search'},
      };

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.search with authentication providers
    should call PlatformClient.call with the right options`, async () => {
      state.configuration.search.authenticationProviders = [
        'myProvider',
        'myOtherProvider',
      ];
      const req = (
        await buildSearchRequest(state, buildMockNavigatorContextProvider()())
      ).request;
      searchAPIClient.search(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];
      const expectedUrl = `${
        state.configuration.search.apiBaseUrl ??
        getSearchApiBaseUrl(
          state.configuration.organizationId,
          state.configuration.environment
        )
      }?${getOrganizationIdQueryParam(req)}&${getAuthenticationQueryParam(
        req
      )}`;
      expect(request.url).toBe(expectedUrl);
    });

    it(`when calling SearchAPIClient.search multiple times
    should abort the previous pending requests`, async () => {
      mockPlatformResponse(() => buildMockSearchEndpointResponse(), 3);
      const req = (
        await buildSearchRequest(state, buildMockNavigatorContextProvider()())
      ).request;
      searchAPIClient.search(req);
      searchAPIClient.search(req);
      searchAPIClient.search(req);
      expect(getPlatformClientCalls()[0].signal?.aborted).toBe(true);
      expect(getPlatformClientCalls()[1].signal?.aborted).toBe(true);
      expect(getPlatformClientCalls()[2].signal?.aborted).toBe(false);
    });

    it(`when calling SearchAPIClient.search with different origins
    should abort only the requests with the same origin`, async () => {
      mockPlatformResponse(() => buildMockSearchEndpointResponse(), 5);
      const req = (
        await buildSearchRequest(state, buildMockNavigatorContextProvider()())
      ).request;
      searchAPIClient.search(req);
      searchAPIClient.search(req, {origin: 'mainSearch'});
      searchAPIClient.search(req, {origin: 'facetValues'});
      searchAPIClient.search(req);
      searchAPIClient.search(req, {origin: 'facetValues'});
      expect(getPlatformClientCalls()[0].signal?.aborted).toBe(true);
      expect(getPlatformClientCalls()[1].signal?.aborted).toBe(false);
      expect(getPlatformClientCalls()[2].signal?.aborted).toBe(true);
      expect(getPlatformClientCalls()[3].signal?.aborted).toBe(false);
      expect(getPlatformClientCalls()[4].signal?.aborted).toBe(false);
    });

    it(`when calling SearchAPIClient.plan
    should call PlatformClient.call with the right options`, async () => {
      const req = await buildPlanRequest(
        state,
        buildMockNavigatorContextProvider()()
      );
      searchAPIClient.plan(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions<
        Omit<PlanRequest, 'accessToken' | 'organizationId' | 'url'>
      > = {
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl ??
          getSearchApiBaseUrl(
            state.configuration.organizationId,
            state.configuration.environment
          )
        }/plan?${getOrganizationIdQueryParam(req)}`,
        logger,
        origin: 'searchApiFetch',
        requestParams: {
          q: state.query.q,
          context: state.context.contextValues,
          pipeline: state.pipeline,
          searchHub: state.searchHub,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
        },
        preprocessRequest: NoopPreprocessRequest,
        requestMetadata: {method: 'plan'},
      };

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.plan with authentication providers
    should call PlatformClient.call with the right options`, async () => {
      state.configuration.search.authenticationProviders = ['myProvider'];
      const req = await buildPlanRequest(
        state,
        buildMockNavigatorContextProvider()()
      );
      searchAPIClient.plan(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];
      const expectedUrl = `${
        state.configuration.search.apiBaseUrl ??
        getSearchApiBaseUrl(
          state.configuration.organizationId,
          state.configuration.environment
        )
      }/plan?${getOrganizationIdQueryParam(req)}&${getAuthenticationQueryParam(
        req
      )}`;
      expect(request.url).toBe(expectedUrl);
    });

    it(`when calling SearchAPIClient.querySuggest
    should call PlatformClient.call with the right options`, async () => {
      const id = 'someid123';
      const qs = buildMockQuerySuggest({id, count: 11});
      state.querySet[id] = 'some query';
      state.querySuggest[id] = qs;

      const req = await buildQuerySuggestRequest(
        id,
        state,
        buildMockNavigatorContextProvider()()
      );
      searchAPIClient.querySuggest(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions<
        Omit<QuerySuggestRequest, 'accessToken' | 'organizationId' | 'url'>
      > = {
        accessToken: state.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          state.configuration.search.apiBaseUrl ??
          getSearchApiBaseUrl(
            state.configuration.organizationId,
            state.configuration.environment
          )
        }/querySuggest?${getOrganizationIdQueryParam(req)}`,
        logger,
        origin: 'searchApiFetch',
        requestParams: {
          q: state.querySet[id],
          count: state.querySuggest[id]!.count,
          context: state.context.contextValues,
          pipeline: state.pipeline,
          searchHub: state.searchHub,
          tab: state.configuration.analytics.originLevel2,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
          actionsHistory: expect.any(Array),
        },
        preprocessRequest: NoopPreprocessRequest,
        requestMetadata: {method: 'querySuggest'},
      };

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.querySuggest with authentication providers
    should call PlatformClient.call with the right options`, async () => {
      const id = 'someid123';
      const qs = buildMockQuerySuggest({id, count: 11});
      state.querySet[id] = 'some query';
      state.querySuggest[id] = qs;
      state.configuration.search.authenticationProviders = ['myProvider'];

      const req = await buildQuerySuggestRequest(
        id,
        state,
        buildMockNavigatorContextProvider()()
      );
      searchAPIClient.querySuggest(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      const expectedUrl = `${
        state.configuration.search.apiBaseUrl ??
        getSearchApiBaseUrl(
          state.configuration.organizationId,
          state.configuration.environment
        )
      }/querySuggest?${getOrganizationIdQueryParam(
        req
      )}&${getAuthenticationQueryParam(req)}`;
      expect(request.url).toBe(expectedUrl);
    });

    describe('SearchAPIClient.facetSearch', () => {
      it('it calls Platform.call with the right options', async () => {
        const id = 'someid123';
        const facetSearchState = buildMockFacetSearch();
        const facetState = buildMockFacetSlice();

        state.facetSearchSet[id] = facetSearchState;
        state.facetSet[id] = facetState;

        const req = await buildSpecificFacetSearchRequest(
          id,
          state,
          buildMockNavigatorContextProvider()(),
          false
        );
        searchAPIClient.facetSearch(req);

        const request = (PlatformClient.call as Mock).mock.calls[0][0];
        const expectedRequest: PlatformClientCallOptions<
          Omit<FacetSearchRequest, 'accessToken' | 'organizationId' | 'url'>
        > = {
          accessToken: state.configuration.accessToken,
          method: 'POST',
          contentType: 'application/json',
          url: `${
            state.configuration.search.apiBaseUrl ??
            getSearchApiBaseUrl(
              state.configuration.organizationId,
              state.configuration.environment
            )
          }/facet?${getOrganizationIdQueryParam(req)}`,
          requestMetadata: {
            method: 'facetSearch',
          },
          logger,
          origin: 'searchApiFetch',
          preprocessRequest: NoopPreprocessRequest,
          requestParams: {
            captions: expect.any(Object),
            field: facetState.request.field,
            filterFacetCount: req.filterFacetCount,
            numberOfValues: facetSearchState.options.numberOfValues,
            query: `*${facetSearchState.options.query}*`,
            type: facetState.request.type,
          },
        };

        expect(request).toMatchObject(expectedRequest);
      });

      it('with an authentication provider it calls Platform.call with the right options', async () => {
        const id = 'someid123';
        const facetSearchState = buildMockFacetSearch();
        const facetState = buildMockFacetSlice();

        state.facetSearchSet[id] = facetSearchState;
        state.facetSet[id] = facetState;
        state.configuration.search.authenticationProviders = ['foo'];

        const req = await buildSpecificFacetSearchRequest(
          id,
          state,
          buildMockNavigatorContextProvider()(),
          false
        );
        searchAPIClient.facetSearch(req);

        const request = (PlatformClient.call as Mock).mock.calls[0][0];
        const expectedUrl = `${
          state.configuration.search.apiBaseUrl ??
          getSearchApiBaseUrl(
            state.configuration.organizationId,
            state.configuration.environment
          )
        }/facet?${getOrganizationIdQueryParam(
          req
        )}&${getAuthenticationQueryParam(req)}`;

        expect(request.url).toBe(expectedUrl);
      });

      it(`when the id is on the facetSearchSet,
      it calls PlatformClient.call with the facet search params`, async () => {
        const id = 'someid123';
        const facetSearchState = buildMockFacetSearch();
        const facetState = buildMockFacetSlice();

        state.facetSearchSet[id] = facetSearchState;
        state.facetSet[id] = facetState;
        const req = await buildSpecificFacetSearchRequest(
          id,
          state,
          buildMockNavigatorContextProvider()(),
          false
        );

        searchAPIClient.facetSearch(req);

        const request = (PlatformClient.call as Mock).mock.calls[0][0];

        const {query} = facetSearchState.options;
        const newQuery = `*${query}*`;

        const searchRequest = (
          await buildSearchRequest(state, buildMockNavigatorContextProvider()())
        ).request;

        expect(request).toMatchObject({
          requestParams: {
            type: 'specific',
            captions: facetSearchState.options.captions,
            numberOfValues: facetSearchState.options.numberOfValues,
            query: newQuery,
            field: facetState.request.field,
            ignoreValues: [],
            searchContext: {
              ...searchRequest,
              analytics: {
                ...searchRequest.analytics,
                clientId: expect.any(String),
                clientTimestamp: expect.any(String),
              },
            },
          },
        });
      });

      it(`when the id is on the categoryFacetSearchSet,
it calls PlatformClient.call with the category facet search params`, async () => {
        const id = '1';
        const categoryFacetSearch = buildMockCategoryFacetSearch();
        const categoryFacet = buildMockCategoryFacetRequest();

        state.categoryFacetSearchSet[id] = categoryFacetSearch;
        state.categoryFacetSet[id] = buildMockCategoryFacetSlice({
          request: categoryFacet,
        });

        const req = await buildCategoryFacetSearchRequest(
          id,
          state,
          buildMockNavigatorContextProvider()(),
          false
        );

        searchAPIClient.facetSearch(req);

        const request = (PlatformClient.call as Mock).mock.calls[0][0];

        const {query} = categoryFacetSearch.options;
        const newQuery = `*${query}*`;

        const searchRequest = (
          await buildSearchRequest(state, buildMockNavigatorContextProvider()())
        ).request;

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
              ...searchRequest,
              analytics: {
                ...searchRequest.analytics,
                clientId: expect.any(String),
                clientTimestamp: expect.any(String),
              },
            },
          },
        });
      });
    });

    it(`when calling SearchAPIClient.recommendations
      should call PlatformClient.call with the right options`, async () => {
      const originLevel2 = 'tab';
      const originLevel3 = 'referrer';
      const analytics = buildMockAnalyticsState({
        originLevel2,
        originLevel3,
        enabled: true,
      });

      const recommendationState = createMockRecommendationState();
      recommendationState.configuration.analytics = analytics;
      recommendationState.pipeline = 'some-pipeline';
      recommendationState.dictionaryFieldContext = {
        contextValues: {price: 'fr'},
      };

      const req = await buildRecommendationRequest(recommendationState);

      searchAPIClient.recommendations(req);

      const expectedRequest: PlatformClientCallOptions<
        Omit<RecommendationRequest, 'accessToken' | 'organizationId' | 'url'>
      > = {
        accessToken: recommendationState.configuration.accessToken,
        method: 'POST',
        contentType: 'application/json',
        url: `${
          recommendationState.configuration.search.apiBaseUrl ??
          getSearchApiBaseUrl(
            recommendationState.configuration.organizationId,
            recommendationState.configuration.environment
          )
        }?${getOrganizationIdQueryParam(req)}`,
        logger,
        origin: 'searchApiFetch',
        requestParams: {
          recommendation: recommendationState.recommendation.id,
          aq: recommendationState.advancedSearchQueries.aq,
          cq: recommendationState.advancedSearchQueries.cq,
          fieldsToInclude: recommendationState.fields.fieldsToInclude,
          context: recommendationState.context.contextValues,
          dictionaryFieldContext:
            recommendationState.dictionaryFieldContext.contextValues,
          pipeline: recommendationState.pipeline,
          searchHub: recommendationState.searchHub,
          timezone: state.configuration.search.timezone,
          locale: state.configuration.search.locale,
          actionsHistory: expect.any(Array),
          tab: originLevel2,
          referrer: originLevel3,
          numberOfResults: recommendationState.pagination.numberOfResults,
        },
        preprocessRequest: NoopPreprocessRequest,
        requestMetadata: {method: 'recommendations'},
      };
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      expect(request).toMatchObject(expectedRequest);
    });

    it(`when calling SearchAPIClient.recommendations with an authentication provider it
      should call PlatformClient.call with the right options`, async () => {
      const recommendationState = createMockRecommendationState();
      recommendationState.configuration.search.authenticationProviders = [
        'all work and no play makes jack a dull boy',
      ];

      const req = await buildRecommendationRequest(recommendationState);

      searchAPIClient.recommendations(req);

      const expectedUrl = `${
        recommendationState.configuration.search.apiBaseUrl ??
        getSearchApiBaseUrl(
          recommendationState.configuration.organizationId,
          recommendationState.configuration.environment
        )
      }?${getOrganizationIdQueryParam(req)}&${getAuthenticationQueryParam(
        req
      )}`;
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      expect(request.url).toBe(expectedUrl);
    });

    it(`when calling SearchAPIClient.fieldDescriptions
should call PlatformClient.call with the right options`, async () => {
      const req = (
        await buildSearchRequest(state, buildMockNavigatorContextProvider()())
      ).request;

      searchAPIClient.fieldDescriptions(req);
      const request = (PlatformClient.call as Mock).mock.calls[0][0];

      const expectedRequest: PlatformClientCallOptions<{}> = {
        accessToken: state.configuration.accessToken,
        contentType: 'application/json',
        logger,
        origin: 'searchApiFetch',
        preprocessRequest: NoopPreprocessRequest,
        requestParams: {},
        requestMetadata: {method: 'fieldDescriptions'},
        method: 'GET',
        url: `${
          state.configuration.search.apiBaseUrl ??
          getSearchApiBaseUrl(
            state.configuration.organizationId,
            state.configuration.environment
          )
        }/fields?${getOrganizationIdQueryParam(req)}`,
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

        const req = await buildResultPreviewRequest(state, {uniqueId: '1'});
        const res = await searchAPIClient.html(req);

        expect(res.success).toBe('hello');
      });

      it('when calling SearchAPIClient.html should call PlatformClient.call with the right options', async () => {
        const req = await buildResultPreviewRequest(state, {uniqueId: '1'});
        searchAPIClient.html(req);
        const request = (PlatformClient.call as Mock).mock.calls[0][0];
        const expectedRequest: PlatformClientCallOptions<
          Omit<HtmlRequest, 'accessToken' | 'organizationId' | 'url'>
        > = {
          accessToken: state.configuration.accessToken,
          contentType: 'application/x-www-form-urlencoded',
          logger,
          method: 'POST',
          origin: 'searchApiFetch',
          url: `${
            state.configuration.search.apiBaseUrl ??
            getSearchApiBaseUrl(
              state.configuration.organizationId,
              state.configuration.environment
            )
          }/html?${getOrganizationIdQueryParam(req)}`,
          preprocessRequest: NoopPreprocessRequest,
          requestParams: {
            enableNavigation: false,
            q: state.query.q,
            requestedOutputSize: req.requestedOutputSize,
            uniqueId: req.uniqueId,
          },
          requestMetadata: {method: 'html'},
        };
        expect(request).toMatchObject(expectedRequest);
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
        (await buildSearchRequest(state, buildMockNavigatorContextProvider()()))
          .request
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
