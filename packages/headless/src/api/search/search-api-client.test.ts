import {SearchAPIClient} from './search-api-client';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PlanRequest} from './plan/plan-request';
import {QuerySuggestRequest} from './query-suggest/query-suggest-request';
import {SearchRequest, searchRequest} from './search/search-request';
import {createMockState} from '../../test/mock-state';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {getOrganizationIdQueryParam} from './search-api-params';
import {SpecificFacetSearchRequest} from './facet-search/specific-facet-search-request';
import {buildMockFacetSearch} from '../../test/mock-facet-search';
import {buildMockFacetRequest} from '../../test/mock-facet-request';

jest.mock('../platform-client');
describe('search api client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when calling SearchAPIClient.search
  should call PlatformClient.call with the right options`, () => {
    const state = createMockState();

    SearchAPIClient.search(state);

    const expectedRequest: PlatformClientCallOptions<SearchRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }?${getOrganizationIdQueryParam(state)}`,
      requestParams: {
        q: state.query.q,
        numberOfResults: state.pagination.numberOfResults,
        sortCriteria: state.sortCriteria,
        firstResult: state.pagination.firstResult,
        facets: [],
        context: state.context.contextValues,
        enableDidYouMean: state.didYouMean.enableDidYouMean,
        fieldsToInclude: state.fields.fieldsToInclude,
        pipeline: state.pipeline,
        searchHub: state.searchHub,
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });

  it(`when calling SearchAPIClient.plan
  should call PlatformClient.call with the right options`, () => {
    const state = createMockState();

    SearchAPIClient.plan(state);

    const expectedRequest: PlatformClientCallOptions<PlanRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/plan?${getOrganizationIdQueryParam(state)}`,
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
    const state = createMockState();
    state.querySuggest[id] = qs;

    SearchAPIClient.querySuggest(id, state);

    const expectedRequest: PlatformClientCallOptions<QuerySuggestRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/querySuggest?${getOrganizationIdQueryParam(state)}`,
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

  it(`when calling SearchAPIClient.facetSearch
  should call PlatformClient.call with the right options`, () => {
    const id = 'someid123';
    const state = createMockState();
    const facetSearchState = buildMockFacetSearch();
    const facetState = buildMockFacetRequest();
    state.facetSearchSet[id] = facetSearchState;
    state.facetSet[id] = facetState;

    SearchAPIClient.facetSearch(id, state);

    const expectedRequest: PlatformClientCallOptions<SpecificFacetSearchRequest> = {
      accessToken: state.configuration.accessToken,
      method: 'POST',
      contentType: 'application/json',
      url: `${
        state.configuration.search.apiBaseUrl
      }/facet?${getOrganizationIdQueryParam(state)}`,
      requestParams: {
        type: 'specific',
        captions: facetSearchState.options.captions,
        numberOfValues: facetSearchState.options.numberOfValues,
        query: facetSearchState.options.query,
        field: facetState.field,
        delimitingCharacter: facetState.delimitingCharacter,
        ignoreValues: [],
        searchContext: searchRequest(state),
      },
    };

    expect(PlatformClient.call).toHaveBeenCalledWith(expectedRequest);
  });
});
