import {Relay} from '@coveo/relay';
import {Logger} from 'pino';
import {InsightAPIClient} from '../../api/service/insight/insight-api-client';
import {InsightQueryRequest} from '../../api/service/insight/query/query-request';
import {defaultNodeJSNavigatorContextProvider} from '../../app/navigatorContextProvider';
import {buildMockInsightQueryRequest} from '../../test/mock-insight-request';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {getInsightConfigurationInitialState} from '../insight-configuration/insight-configuration-state';
import {updateQuery} from '../query/query-actions';
import {ExecuteSearchThunkReturn} from '../search/search-actions';
import {MappedSearchRequest, SearchMappings} from '../search/search-mappings';
import {
  AsyncInsightSearchThunkProcessor,
  AsyncThunkConfig,
} from './insight-search-actions-thunk-processor';
import {logQueryError} from './insight-search-analytics-actions';

jest.mock('./insight-search-analytics-actions');

const initialSearchMappings: () => SearchMappings = () => ({
  dateFacetValueMap: {},
});

describe('AsyncInsightSearchThunkProcessor', () => {
  let config: AsyncThunkConfig;
  const results = [buildMockResult({uniqueId: '123'})];
  beforeEach(() => {
    config = {
      dispatch: jest.fn(),
      extra: {
        analyticsClientMiddleware: jest.fn(),
        apiClient: {query: jest.fn()} as unknown as InsightAPIClient,
        logger: jest.fn() as unknown as Logger,
        validatePayload: jest.fn(),
        preprocessRequest: jest.fn(),
        relay: jest.fn() as unknown as Relay,
        navigatorContext: defaultNodeJSNavigatorContextProvider(),
      },
      getState: jest.fn().mockReturnValue({
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
      rejectWithValue: jest.fn(),
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
      fetched
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

    (await processor.process(fetched)) as ExecuteSearchThunkReturn;

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

    (config.extra.apiClient.query as jest.Mock).mockReturnValue(
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
      fetched
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
