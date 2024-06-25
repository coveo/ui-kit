import {createRelay} from '@coveo/relay';
import {Logger} from 'pino';
import {CommerceAPIClient} from '../../../api/commerce/commerce-api-client';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response';
import {defaultNodeJSNavigatorContextProvider} from '../../../app/navigatorContextProvider';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {buildMockProduct} from '../../../test/mock-product';
import {buildCommerceAPIRequest} from '../common/actions';
import {updateQuery} from '../query/query-actions';
import {QuerySearchCommerceAPIThunkReturn} from './search-actions';
import {
  AsyncThunkConfig,
  AsyncSearchThunkProcessor,
} from './search-actions-thunk-processor';

describe('commerce AsyncSearchThunkProcessor', () => {
  let config: AsyncThunkConfig;
  let state: CommerceAppState;
  beforeEach(() => {
    state = buildMockCommerceState();
    config = {
      dispatch: jest.fn(),
      extra: {
        analyticsClientMiddleware: jest.fn(),
        apiClient: {search: jest.fn()} as unknown as CommerceAPIClient,
        logger: jest.fn() as unknown as Logger,
        validatePayload: jest.fn(),
        preprocessRequest: jest.fn(),
        relay: createRelay({
          token: 'token',
          url: 'url',
          trackingId: 'trackingId',
        }),
        navigatorContext: defaultNodeJSNavigatorContextProvider(),
      },
      getState: jest.fn().mockReturnValue(state),
      rejectWithValue: jest.fn(),
    };
  });

  async function simulateProcessing(
    response:
      | {error: CommerceAPIErrorStatusResponse}
      | {success: SearchCommerceSuccessResponse}
  ) {
    const processor =
      new AsyncSearchThunkProcessor<QuerySearchCommerceAPIThunkReturn>(config);
    const fetched = {
      response,
      duration: 123,
      queryExecuted: 'foo',
      requestExecuted: buildCommerceAPIRequest(
        state,
        config.extra.relay,
        config.extra.navigatorContext
      ),
    };
    return processor.process(fetched);
  }

  it('process properly when there is no error, products are returned, and no modification applies', async () => {
    const search = buildSearchResponse({products: [buildMockProduct()]});
    const processed = await simulateProcessing({success: search.response});

    expect(processed.response).toMatchObject(search.response);
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
  });

  it('processes properly when there is an error returned by the API', async () => {
    const theError = {
      statusCode: 500,
      message: 'Something went wrong',
      type: 'error',
    };
    await simulateProcessing({error: theError});

    expect(config.rejectWithValue).toHaveBeenCalledWith(theError);
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
  });

  it('process properly when #queryCorrection is activated on the query˝', async () => {
    const originalResponseWithProductsAndChangedQuery = buildSearchResponse({
      products: [buildMockProduct()],
      queryCorrection: {
        correctedQuery: 'bar',
        originalQuery: 'foo',
        corrections: [],
      },
    });

    const processed = await simulateProcessing({
      success: originalResponseWithProductsAndChangedQuery.response,
    });

    expect(config.dispatch).toHaveBeenCalledWith(updateQuery({query: 'bar'}));
    expect(config.extra.apiClient.search).not.toHaveBeenCalled();
    expect(processed.response).toMatchObject(
      originalResponseWithProductsAndChangedQuery.response
    );
    expect(processed.originalQuery).toBe('foo');
    expect(processed.queryExecuted).toBe('bar');
  });

  it('process properly when there is a query trigger', async () => {
    const originalResponseWithQueryTrigger = buildSearchResponse({
      products: [buildMockProduct()],
      triggers: [{content: 'bar', type: 'query'}],
    });

    const responseAfterModification = buildSearchResponse({
      products: [buildMockProduct()],
    });

    (config.extra.apiClient.search as jest.Mock).mockReturnValue(
      Promise.resolve({success: responseAfterModification})
    );

    const processed = await simulateProcessing({
      success: originalResponseWithQueryTrigger.response,
    });

    expect(config.extra.apiClient.search).toHaveBeenCalled();
    expect(processed.response).toMatchObject(responseAfterModification);
  });
});
