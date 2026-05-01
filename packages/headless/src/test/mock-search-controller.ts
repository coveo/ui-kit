import {vi} from 'vitest';
import type {Search} from '../controllers/commerce/search/headless-search.js';

export function buildMockSearchController(): Search {
  return {
    parameterManager: vi.fn(),
    summary: vi.fn(),
    breadcrumbManager: vi.fn(),
    facetGenerator: vi.fn(),
    pagination: vi.fn(),
    subscribe: vi.fn(),
    state: {
      products: [],
      results: [],
      error: null,
      isLoading: false,
      responseId: '',
    },
    executeFirstSearch: vi.fn(),
    interactiveProduct: vi.fn(),
    interactiveSpotlightContent: vi.fn(),
    promoteChildToParent: vi.fn(),
    sort: vi.fn(),
    didYouMean: vi.fn(),
    urlManager: vi.fn(),
  };
}
