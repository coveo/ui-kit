import type {Relay} from '@coveo/relay';
import type {Logger} from 'pino';
import {type Mock} from 'vitest';
import type {SearchAPIClient} from '../../api/search/search-api-client.js';
import {defaultNodeJSNavigatorContextProvider} from '../../app/navigator-context-provider.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearchRequest} from '../../test/mock-search-request.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {updateQuery} from '../query/query-actions.js';
import type {ExecuteSearchThunkReturn} from './search-actions.js';
import {AsyncSearchThunkProcessor} from './search-actions-thunk-processor.js';

vi.mock('./search-analytics-actions');

interface AsyncThunkConfig {
  dispatch: Mock;
  extra: {
    analyticsClientMiddleware: Mock;
    apiClient: {search: Mock};
    logger: unknown;
    validatePayload: Mock;
    preprocessRequest: Mock;
    relay: unknown;
    navigatorContext: ReturnType<typeof defaultNodeJSNavigatorContextProvider>;
  };
  getState: Mock;
  rejectWithValue: Mock;
  analyticsAction: Record<string, unknown>;
}

describe('AsyncSearchThunkProcessor', () => {
  let config: AsyncThunkConfig;
  const results = [buildMockResult()];

  beforeEach(() => {
    config = {
      analyticsAction: {},
      dispatch: vi.fn(),
      extra: {
        analyticsClientMiddleware: vi.fn(),
        apiClient: {search: vi.fn()},
        logger: vi.fn() as unknown as Logger,
        validatePayload: vi.fn(),
        preprocessRequest: vi.fn(),
        relay: vi.fn() as unknown as Relay,
        navigatorContext: defaultNodeJSNavigatorContextProvider(),
      },
      getState: vi.fn().mockReturnValue({
        configuration: getConfigurationInitialState(),
        search: buildMockSearchState({
          results,
          response: buildMockSearchResponse({results}),
        }),
        didYouMean: {
          enableDidYouMean: true,
          automaticallyCorrectQuery: true,
          queryCorrectionMode: 'next',
        },
      }),
      rejectWithValue: vi.fn(),
    };
  });

  describe('when server applies query correction and automaticallyCorrectQuery is false', () => {
    beforeEach(() => {
      config.getState = vi.fn().mockReturnValue({
        configuration: getConfigurationInitialState(),
        search: buildMockSearchState({
          results,
          response: buildMockSearchResponse({results}),
        }),
        query: {q: 'hone', enableQuerySyntax: false},
        didYouMean: {
          enableDidYouMean: true,
          automaticallyCorrectQuery: false,
          queryCorrectionMode: 'next',
        },
      });
    });

    it('should update query state to the corrected query when server returns queryCorrection.correctedQuery', async () => {
      const processor = new AsyncSearchThunkProcessor<{}>(config as never);

      const responseWithServerCorrection = buildMockSearchResponse({
        results: [buildMockResult()],
        queryCorrection: {
          correctedQuery: 'honeywell',
          originalQuery: 'hone',
          corrections: [],
        },
      });

      const fetched = {
        response: {
          success: responseWithServerCorrection,
        },
        duration: 123,
        queryExecuted: 'hone',
        requestExecuted: buildMockSearchRequest(),
      };

      const processed = (await processor.process(fetched)) as ExecuteSearchThunkReturn;

      expect(config.dispatch).toHaveBeenCalledWith(updateQuery({q: 'honeywell'}));
      expect(processed.queryExecuted).toBe('honeywell');
      expect(processed.originalQuery).toBe('hone');
      expect(processed.automaticallyCorrected).toBe(true);
    });

    it('should not re-fetch from API since the server already corrected', async () => {
      const processor = new AsyncSearchThunkProcessor<{}>(config as never);

      const responseWithServerCorrection = buildMockSearchResponse({
        results: [buildMockResult()],
        queryCorrection: {
          correctedQuery: 'honeywell',
          originalQuery: 'hone',
          corrections: [],
        },
      });

      const fetched = {
        response: {
          success: responseWithServerCorrection,
        },
        duration: 123,
        queryExecuted: 'hone',
        requestExecuted: buildMockSearchRequest(),
      };

      await processor.process(fetched);

      expect(config.extra.apiClient.search).not.toHaveBeenCalled();
    });

    it('should not update query when server returns empty queryCorrection', async () => {
      const processor = new AsyncSearchThunkProcessor<{}>(config as never);

      const responseWithNoCorrection = buildMockSearchResponse({
        results: [buildMockResult()],
      });

      const fetched = {
        response: {
          success: responseWithNoCorrection,
        },
        duration: 123,
        queryExecuted: 'hone',
        requestExecuted: buildMockSearchRequest(),
      };

      await processor.process(fetched);

      expect(config.dispatch).not.toHaveBeenCalledWith(updateQuery({q: expect.any(String)}));
    });
  });
});
