import {Relay} from '@coveo/relay';
import {Logger} from 'pino';
import {SearchAPIClient} from '../../../api/search/search-api-client';
import {defaultNodeJSNavigatorContextProvider} from '../../../app/navigatorContextProvider';
import {buildMockResult} from '../../../test/mock-result';
import {buildMockSearchRequest} from '../../../test/mock-search-request';
import {buildMockSearchResponse} from '../../../test/mock-search-response';
import {buildMockSearchState} from '../../../test/mock-search-state';
import {getConfigurationInitialState} from '../../configuration/configuration-state';
import {updateQuery} from '../../query/query-actions';
import {logSearchboxSubmit} from '../../query/query-analytics-actions';
import {logQueryError} from '../search-analytics-actions';
import {ExecuteSearchThunkReturn} from './search-actions';
import {
  AsyncSearchThunkProcessor,
  AsyncThunkConfig,
} from './search-actions-thunk-processor';

jest.mock('../search-analytics-actions');

describe('AsyncSearchThunkProcessor', () => {
  let config: AsyncThunkConfig;
  const results = [buildMockResult()];
  beforeEach(() => {
    config = {
      analyticsAction: logSearchboxSubmit(),
      dispatch: jest.fn(),
      extra: {
        analyticsClientMiddleware: jest.fn(),
        apiClient: {search: jest.fn()} as unknown as SearchAPIClient,
        logger: jest.fn() as unknown as Logger,
        validatePayload: jest.fn(),
        preprocessRequest: jest.fn(),
        relay: jest.fn() as unknown as Relay,
        navigatorContext: defaultNodeJSNavigatorContextProvider(),
      },
      getState: jest.fn().mockReturnValue({
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
    const processor = new AsyncSearchThunkProcessor<{}>(config);

    const searchResponse = buildMockSearchResponse({
      results: [buildMockResult()],
    });

    const fetched = {
      response: {
        success: searchResponse,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildMockSearchRequest(),
    };

    const processed = (await processor.process(
      fetched
    )) as ExecuteSearchThunkReturn;

    expect(processed.response).toMatchObject(searchResponse);
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
  });

  it('processes properly when there is an error returned by the API', async () => {
    const processor = new AsyncSearchThunkProcessor<{}>(config);
    const theError = {
      statusCode: 500,
      message: 'Something went wrong',
      type: 'error',
    };

    const fetched = {
      response: {
        error: theError,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildMockSearchRequest(),
    };

    (await processor.process(fetched)) as ExecuteSearchThunkReturn;

    expect(config.rejectWithValue).toHaveBeenCalledWith(theError);
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
    expect(logQueryError).toHaveBeenCalledWith(theError);
  });

  it('process properly when there are no results returned and there is a did you mean correction', async () => {
    const processor = new AsyncSearchThunkProcessor<{}>(config);

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
      results: [buildMockResult()],
    });

    (config.extra.apiClient.search as jest.Mock).mockReturnValue(
      Promise.resolve({success: responseAfterCorrection})
    );

    const fetched = {
      response: {
        success: originalResponseWithNoResultsAndCorrection,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildMockSearchRequest(),
    };

    const processed = (await processor.process(
      fetched
    )) as ExecuteSearchThunkReturn;

    expect(config.dispatch).toHaveBeenCalledWith(updateQuery({q: 'bar'}));
    expect(config.extra.apiClient.search).toHaveBeenCalled();
    expect(processed.response).toMatchObject({
      ...responseAfterCorrection,
      queryCorrections:
        originalResponseWithNoResultsAndCorrection.queryCorrections,
    });
    expect(processed.automaticallyCorrected).toBe(true);
  });

  it('process properly when #queryCorrection is activated on the query˝', async () => {
    const processor = new AsyncSearchThunkProcessor<{}>(config);

    const originalResponseWithResultsAndChangedQuery = buildMockSearchResponse({
      results: [buildMockResult()],
      queryCorrection: {
        correctedQuery: 'bar',
        originalQuery: 'foo',
        corrections: [],
      },
    });

    const fetched = {
      response: {
        success: originalResponseWithResultsAndChangedQuery,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildMockSearchRequest(),
    };

    const processed = (await processor.process(
      fetched
    )) as ExecuteSearchThunkReturn;

    expect(config.dispatch).toHaveBeenCalledWith(updateQuery({q: 'bar'}));
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
    expect(processed.response).toMatchObject(
      originalResponseWithResultsAndChangedQuery
    );
    expect(processed.automaticallyCorrected).toBe(true);
    expect(processed.originalQuery).toBe('foo');
    expect(processed.queryExecuted).toBe('bar');
  });

  it('process properly when there are no results returned, there is a did you mean correction, and automatic correction is disabled', async () => {
    const processor = new AsyncSearchThunkProcessor<{}>({
      ...config,
      getState: jest.fn().mockReturnValue({
        configuration: getConfigurationInitialState(),
        search: buildMockSearchState({
          results,
          response: buildMockSearchResponse({results}),
        }),
        didYouMean: {
          enableDidYouMean: true,
          automaticallyCorrectQuery: false,
        },
      }),
    });

    const searchResponse = buildMockSearchResponse({
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

    const fetched = {
      response: {
        success: searchResponse,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildMockSearchRequest(),
    };

    const processed = (await processor.process(
      fetched
    )) as ExecuteSearchThunkReturn;

    expect(processed.response).toMatchObject(searchResponse);
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
  });

  it('process properly when there is a query trigger', async () => {
    const processor = new AsyncSearchThunkProcessor<{}>(config);

    const originalResponseWithQueryTrigger = buildMockSearchResponse({
      results: [buildMockResult()],
      triggers: [{content: 'bar', type: 'query'}],
    });

    const responseAfterModification = buildMockSearchResponse({
      results: [buildMockResult()],
    });

    (config.extra.apiClient.search as jest.Mock).mockReturnValue(
      Promise.resolve({success: responseAfterModification})
    );

    const fetched = {
      response: {
        success: originalResponseWithQueryTrigger,
      },
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildMockSearchRequest(),
    };

    const processed = (await processor.process(
      fetched
    )) as ExecuteSearchThunkReturn;

    expect(config.dispatch).toHaveBeenCalledWith(config.analyticsAction);
    expect(config.extra.apiClient.search).toHaveBeenCalled();
    expect(processed.response).toMatchObject(responseAfterModification);
  });
});
