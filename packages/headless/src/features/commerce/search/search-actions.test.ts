import type {Relay} from '@coveo/relay';
import type {Logger} from 'pino';
import {type Mock, vi} from 'vitest';
import type {CommerceAPIClient} from '../../../api/commerce/commerce-api-client.js';
import {defaultNodeJSNavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {buildMockSpotlightContent} from '../../../test/mock-spotlight-content.js';
import {fetchMoreProducts} from './search-actions.js';

function buildConfig(state: CommerceAppState) {
  const search = vi.fn();
  const config = {
    dispatch: vi.fn(),
    extra: {
      analyticsClientMiddleware: vi.fn(),
      apiClient: {search} as unknown as CommerceAPIClient,
      logger: vi.fn() as unknown as Logger,
      validatePayload: vi.fn(),
      preprocessRequest: vi.fn(),
      relay: vi.fn() as unknown as Relay,
      navigatorContext: defaultNodeJSNavigatorContextProvider(),
    },
    getState: vi.fn().mockReturnValue(state),
    rejectWithValue: vi.fn(),
  };
  return {config, search};
}

function buildStateWithLoadedPages(options: {
  perPage: number;
  pagesLoaded: number;
  spotlightsPerPage: number;
  totalEntries: number;
}): CommerceAppState {
  const {perPage, pagesLoaded, spotlightsPerPage, totalEntries} = options;
  const products = Array.from({length: perPage * pagesLoaded}, () => buildMockProduct());
  const results = [];
  for (let page = 0; page < pagesLoaded; page++) {
    for (let i = 0; i < perPage; i++) {
      results.push(buildMockProduct());
    }
    for (let s = 0; s < spotlightsPerPage; s++) {
      results.push(buildMockSpotlightContent());
    }
  }
  return buildMockCommerceState({
    commerceSearch: {
      responseId: 'response-id',
      products,
      results,
      isLoading: false,
      error: null,
      facets: [],
      requestId: 'request-id',
      queryExecuted: 'some-query',
    },
    commercePagination: {
      principal: {
        perPage,
        page: 0,
        totalEntries,
        totalPages: Math.ceil(totalEntries / perPage),
      },
      recommendations: {},
    },
  });
}

function getRequestedPage(search: Mock) {
  return search.mock.calls[0][0].page;
}

describe('commerce search actions', () => {
  describe('#fetchMoreProducts', () => {
    it('should request the next product page from the product count, ignoring spotlight content', async () => {
      const perPage = 5;
      const state = buildStateWithLoadedPages({
        perPage,
        pagesLoaded: 2,
        spotlightsPerPage: 3,
        totalEntries: 100,
      });
      const {config, search} = buildConfig(state);
      search.mockResolvedValue({
        success: buildSearchResponse({
          pagination: {
            page: 2,
            perPage,
            totalEntries: 100,
            totalPages: 20,
            totalProducts: 100,
            totalSpotlightContent: 0,
          },
        }).response,
      });

      await fetchMoreProducts({})(config.dispatch, config.getState, config.extra);

      expect(getRequestedPage(search)).toBe(2);
    });

    it('should request an integer page even when cumulative spotlights reach perPage', async () => {
      const perPage = 5;
      const state = buildStateWithLoadedPages({
        perPage,
        pagesLoaded: 4,
        spotlightsPerPage: 5,
        totalEntries: 100,
      });
      const {config, search} = buildConfig(state);
      search.mockResolvedValue({
        success: buildSearchResponse({
          pagination: {
            page: 4,
            perPage,
            totalEntries: 100,
            totalPages: 20,
            totalProducts: 100,
            totalSpotlightContent: 0,
          },
        }).response,
      });

      await fetchMoreProducts({})(config.dispatch, config.getState, config.extra);

      const requestedPage = getRequestedPage(search);
      expect(Number.isInteger(requestedPage)).toBe(true);
      expect(requestedPage).toBe(4);
    });
  });
});
