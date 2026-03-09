import {vi} from 'vitest';
import type {CoreEngine, CoreEngineNext} from '../app/engine.js';
import type {ProductListing} from '../controllers/commerce/product-listing/headless-product-listing.js';
import type {Search} from '../controllers/commerce/search/headless-search.js';
import type {Controller} from '../controllers/controller/headless-controller.js';
import type {SSRCommerceEngine} from '../ssr/commerce/factories/build-factory.js';

interface MockController {
  initialState?: Record<string, unknown>;
}

export function buildMockController(): Controller {
  return {
    subscribe: vi.fn(),
    state: {},
  } as Controller;
}

export function buildMockControllerWithInitialState(
  _engine: CoreEngine | CoreEngineNext | SSRCommerceEngine,
  props: MockController
): Controller {
  return {
    state: props.initialState,
    subscribe: vi.fn(),
  } as Controller;
}

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
