import {vi} from 'vitest';
import type {SearchEngine} from '../app/search-engine/search-engine.js';
import type {Controller} from '../controllers/controller/headless-controller.js';
import type {Kind} from '../ssr/commerce/types/kind.js';
import type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
} from '../ssr-next/common/types/controllers.js';
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
      _kind: 'some-kind' as Kind,
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
