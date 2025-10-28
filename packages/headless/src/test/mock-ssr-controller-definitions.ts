import {vi} from 'vitest';
import type {SearchEngine} from '../app/search-engine/search-engine.js';
import type {Controller} from '../controllers/controller/headless-controller.js';
import type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
} from '../ssr/common/types/controllers.js';
import {recommendationInternalOptionKey} from '../ssr-next/commerce/types/controller-constants.js';
import type {SSRSearchEngine} from '../ssr-next/search/types/build.js';
import type {
  ControllerDefinitionWithoutProps as SearchControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps as SearchControllerDefinitionWithProps,
} from '../ssr-next/search/types/controller-definition.js';
import {
  buildMockController,
  buildMockControllerWithInitialState,
} from './mock-controller.js';

interface MockController {
  initialState?: Record<string, unknown>;
}

interface MockControllerDefinitionWithoutProps
  extends ControllerDefinitionWithoutProps<SearchEngine, Controller> {}

interface MockControllerDefinitionWithProps
  extends ControllerDefinitionWithProps<
    SearchEngine,
    Controller,
    MockController
  > {}

type SolutionTypeAvailabilities = {
  listing?: boolean;
  search?: boolean;
  standalone?: boolean;
  recommendation?: boolean;
};

export function defineMockController(): MockControllerDefinitionWithoutProps {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
  };
}

export function defineMockControllerWithProps(): MockControllerDefinitionWithProps {
  return {
    buildWithProps: vi.fn((engine, props) => {
      return buildMockControllerWithInitialState(engine, {
        initialState: props?.initialState,
      });
    }),
  };
}

export function defineMockCommerceController(
  options?: SolutionTypeAvailabilities
) {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
    listing: options?.listing ?? true,
    search: options?.search ?? true,
    standalone: options?.standalone ?? true,
    recommendation: options?.recommendation ?? true,
  };
}

export function defineMockCommerceControllerWithProps(
  options?: SolutionTypeAvailabilities
) {
  return {
    buildWithProps: vi.fn((engine, props) => ({
      ...buildMockControllerWithInitialState(engine, {
        initialState: props?.initialState,
      }),
    })),
    listing: options?.listing ?? true,
    search: options?.search ?? true,
    standalone: options?.standalone ?? true,
    recommendation: options?.recommendation ?? true,
  };
}

export function defineMockRecommendationDefinition(slotId: string) {
  return {
    recommendation: true,
    [recommendationInternalOptionKey]: {
      slotId,
    },
    buildWithProps: vi.fn((engine, props) => ({
      ...buildMockControllerWithInitialState(engine, {
        initialState: props?.initialState,
      }),
    })),
  };
}

interface MockSearchController {
  initialState?: Record<string, unknown>;
}

interface MockSearchControllerDefinitionWithoutProps
  extends SearchControllerDefinitionWithoutProps<SSRSearchEngine, Controller> {}

interface MockSearchControllerDefinitionWithProps
  extends SearchControllerDefinitionWithProps<
    SSRSearchEngine,
    Controller,
    MockSearchController
  > {}

export function defineMockSearchController(): MockSearchControllerDefinitionWithoutProps {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
  };
}

export function defineMockSearchControllerWithProps(): MockSearchControllerDefinitionWithProps {
  return {
    buildWithProps: vi.fn((engine, props) => {
      return buildMockControllerWithInitialState(engine, {
        initialState: props?.initialState,
      });
    }),
  };
}

export function defineMockSearchParameterManager(): MockSearchControllerDefinitionWithProps {
  return {
    buildWithProps: vi.fn((engine, props) => {
      return buildMockControllerWithInitialState(engine, {
        initialState: props?.initialState,
      });
    }),
  };
}
