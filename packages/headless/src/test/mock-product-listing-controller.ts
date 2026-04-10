import {vi} from 'vitest';
import type {ProductListing} from '../controllers/commerce/product-listing/headless-product-listing.js';

export function buildMockProductListingController(): ProductListing {
  return {
    parameterManager: vi.fn(),
    summary: vi.fn(),
    breadcrumbManager: vi.fn(),
    facetGenerator: vi.fn(),
    pagination: vi.fn(),
    urlManager: vi.fn(),
    subscribe: vi.fn(),
    state: {
      products: [],
      results: [],
      error: null,
      isLoading: false,
      responseId: '',
    },
    executeFirstRequest: vi.fn(),
    interactiveProduct: vi.fn(),
    interactiveSpotlightContent: vi.fn(),
    promoteChildToParent: vi.fn(),
    refresh: vi.fn(),
    sort: vi.fn(),
  };
}
