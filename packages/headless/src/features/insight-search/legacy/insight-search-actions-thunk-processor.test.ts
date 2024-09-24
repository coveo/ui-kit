import {Relay} from '@coveo/relay';
import {Logger} from 'pino';
import {Mock} from 'vitest';
import {InsightAPIClient} from '../../../api/service/insight/insight-api-client.js';
import {InsightQueryRequest} from '../../../api/service/insight/query/query-request.js';
import {defaultNodeJSNavigatorContextProvider} from '../../../app/navigatorContextProvider.js';
import {buildMockInsightQueryRequest} from '../../../test/mock-insight-request.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {buildMockSearchResponse} from '../../../test/mock-search-response.js';
import {buildMockSearchState} from '../../../test/mock-search-state.js';
import {getConfigurationInitialState} from '../../configuration/configuration-state.js';
import {getInsightConfigurationInitialState} from '../../insight-configuration/insight-configuration-state.js';
import {updateQuery} from '../../query/query-actions.js';
import {ExecuteSearchThunkReturn} from '../../search/legacy/search-actions.js';
import {
  MappedSearchRequest,
  SearchMappings,
} from '../../search/search-mappings.js';
import {
  logFetchMoreResults,
  logQueryError,
} from '../insight-search-analytics-actions.js';
import {
  AsyncInsightSearchThunkProcessor,
  AsyncThunkConfig,
} from './insight-search-actions-thunk-processor.js';

vi.mock('../insight-search-analytics-actions');

const initialSearchMappings: () => SearchMappings = () => ({
  dateFacetValueMap: {},
});

describe('AsyncInsightSearchThunkProcessor', () => {
  let config: AsyncThunkConfig;
  const results = [buildMockResult({uniqueId: '123'})];
  beforeEach(() => {
    config = {
      analyticsAction: logFetchMoreResults(),
      dispatch: vi.fn(),
      extra: {
        analyticsClientMiddleware: vi.fn(),
        apiClient: {query: vi.fn()} as unknown as InsightAPIClient,
        logger: vi.fn() as unknown as Logger,
        validatePayload: vi.fn(),
        preprocessRequest: vi.fn(),
        relay: vi.fn() as unknown as Relay,
        navigatorContext: defaultNodeJSNavigatorContextProvider(),
      },
      getState: vi.fn().mockReturnValue({
        insightConfiguration: getInsightConfigurationInitialState(),
        configuration: getConfigurationInitialState(),
        search: buildMockSearchState({
          results,
          response: buildMockSearchResponse({results}),
        }),
        didYouMean: {
          enableDidYouMean: true,
          automaticallyCorrectQuery: true,
        },
      }),
      rejectWithValue: vi.fn(),
    };
  });

  it('process properly when there is no error, results are returned, and no modification applies', async () => {
    const processor = new AsyncInsightSearchThunkProcessor<{}>(config);

    const searchResponse = buildMockSearchResponse({
      results: [buildMockResult({uniqueId: '123'})],
    });
    const mappedRequest: MappedSearchRequest<InsightQueryRequest> = {
      request: buildMockInsightQueryRequest(),
      mappings: initialSearchMappings(),
    };

    const fetched = {
      response: {
        success: searchResponse,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: mappedRequest.request,
    };

    const processed = (await processor.process(
      fetched,
      mappedRequest
    )) as ExecuteSearchThunkReturn;

    expect(processed.response).toEqual(searchResponse);
    expect(config.extra.apiClient.query).not.toHaveBeenCalled();
  });

  it('processes properly when there is an error returned by the API', async () => {
    const processor = new AsyncInsightSearchThunkProcessor<{}>(config);
    const theError = {
      statusCode: 500,
      message: 'Something went wrong',
      type: 'error',
    };
    const mappedRequest: MappedSearchRequest<InsightQueryRequest> = {
      request: buildMockInsightQueryRequest(),
      mappings: initialSearchMappings(),
    };

    const fetched = {
      response: {
        error: theError,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: mappedRequest.request,
    };

    (await processor.process(
      fetched,
      mappedRequest
    )) as ExecuteSearchThunkReturn;

    expect(config.rejectWithValue).toHaveBeenCalledWith(theError);
    expect(config.extra.apiClient.query).not.toHaveBeenCalled();
    expect(logQueryError).toHaveBeenCalledWith(theError);
  });

  it('process properly when there are no results returned and there is a did you mean correction', async () => {
    const processor = new AsyncInsightSearchThunkProcessor<{}>(config);
    const mappedRequest: MappedSearchRequest<InsightQueryRequest> = {
      request: buildMockInsightQueryRequest(),
      mappings: initialSearchMappings(),
    };

    const originalResponseWithNoResultsAndCorrection = buildMockSearchResponse({
      results: [],
      queryCorrections: [
        {
          correctedQuery: 'bar',
          wordCorrections: [
            {correctedWord: 'foo', length: 3, offset: 0, originalWord: 'foo'},
          ],
        },
      ],
    });

    const responseAfterCorrection = buildMockSearchResponse({
      results: [buildMockResult({uniqueId: '123'})],
    });

    (config.extra.apiClient.query as Mock).mockReturnValue(
      Promise.resolve({success: responseAfterCorrection})
    );

    const fetched = {
      response: {
        success: originalResponseWithNoResultsAndCorrection,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: mappedRequest.request,
    };

    const processed = (await processor.process(
      fetched,
      mappedRequest
    )) as ExecuteSearchThunkReturn;

    expect(config.dispatch).toHaveBeenCalledWith(updateQuery({q: 'bar'}));
    expect(config.extra.apiClient.query).toHaveBeenCalled();
    expect(processed.response).toEqual({
      ...responseAfterCorrection,
      queryCorrections:
        originalResponseWithNoResultsAndCorrection.queryCorrections,
    });
    expect(processed.automaticallyCorrected).toBe(true);
  });
});
