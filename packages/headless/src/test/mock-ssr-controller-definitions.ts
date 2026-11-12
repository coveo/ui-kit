import {vi} from 'vitest';
import type {Controller} from '../controllers/controller/headless-controller.js';
import {recommendationInternalOptionKey} from '../ssr-next/commerce/types/controller-constants.js';
import type {SSRSearchEngine} from '../ssr-next/search/types/build.js';
import type {ControllerDefinition as SearchControllerDefinition} from '../ssr-next/search/types/controller-definition.js';
import {buildMockController, buildMockControllerWithInitialState} from './mock-controller.js';

type SolutionTypeAvailabilities = {
  listing?: boolean;
  search?: boolean;
  standalone?: boolean;
};

export function defineMockCommerceController(options?: SolutionTypeAvailabilities) {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
    listing: options?.listing ?? true,
    search: options?.search ?? true,
    standalone: options?.standalone ?? true,
  };
}

/**
 * A commerce controller whose state is the page facts it was built with.
 */
export function defineMockCommerceControllerReadingPageFacts(options?: SolutionTypeAvailabilities) {
  return {
    build: vi.fn((engine, context) =>
      buildMockControllerWithInitialState(engine, {
        initialState: context?.buildConfig,
      })
    ),
    listing: options?.listing ?? true,
    search: options?.search ?? true,
    standalone: options?.standalone ?? true,
  };
}

/**
 * A recommendation slot whose state carries the product it was seeded with.
 */
export function defineMockRecommendationDefinition(slotId: string) {
  return {
    search: true,
    listing: true,
    standalone: true,
    [recommendationInternalOptionKey]: {
      slotId,
    },
    build: vi.fn((engine, context) =>
      buildMockControllerWithInitialState(engine, {
        initialState: {productId: context?.buildConfig?.productId},
      })
    ),
  };
}

interface MockSearchControllerDefinition extends SearchControllerDefinition<
  SSRSearchEngine,
  Controller
> {}

export function defineMockSearchController(): MockSearchControllerDefinition {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
  };
}

/**
 * A search controller whose state is the page facts it was built with.
 */
export function defineMockSearchControllerReadingPageFacts(): MockSearchControllerDefinition {
  return {
    build: vi.fn((engine, context) =>
      buildMockControllerWithInitialState(engine, {
        initialState: context?.buildConfig,
      })
    ),
  };
}
