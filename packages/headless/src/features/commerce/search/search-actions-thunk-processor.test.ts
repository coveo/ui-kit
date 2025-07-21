import type {Relay} from '@coveo/relay';
import type {Logger} from 'pino';
import type {Mock} from 'vitest';
import type {CommerceAPIClient} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import {defaultNodeJSNavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {buildFilterableCommerceAPIRequest} from '../common/filterable-commerce-api-request-builder.js';
import {updateQuery} from '../query/query-actions.js';
import type {QuerySearchCommerceAPIThunkReturn} from './search-actions.js';
import {
  AsyncSearchThunkProcessor,
  type AsyncThunkConfig,
} from './search-actions-thunk-processor.js';

describe('commerce AsyncSearchThunkProcessor', () => {
  let config: AsyncThunkConfig;
  let state: CommerceAppState;
  beforeEach(() => {
    state = buildMockCommerceState();
    config = {
      dispatch: vi.fn(),
      extra: {
        analyticsClientMiddleware: vi.fn(),
        apiClient: {search: vi.fn()} as unknown as CommerceAPIClient,
        logger: vi.fn() as unknown as Logger,
        validatePayload: vi.fn(),
        preprocessRequest: vi.fn(),
        relay: vi.fn() as unknown as Relay,
        navigatorContext: defaultNodeJSNavigatorContextProvider(),
      },
      getState: vi.fn().mockReturnValue(state),
      rejectWithValue: vi.fn(),
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
      requestExecuted: buildFilterableCommerceAPIRequest(
        state,
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

    (config.extra.apiClient.search as Mock).mockReturnValue(
      Promise.resolve({success: responseAfterModification})
    );

    const processed = await simulateProcessing({
      success: originalResponseWithQueryTrigger.response,
    });

    expect(config.extra.apiClient.search).toHaveBeenCalled();
    expect(processed.response).toMatchObject(responseAfterModification);
  });
});
