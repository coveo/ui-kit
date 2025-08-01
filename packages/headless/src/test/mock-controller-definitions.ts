import {vi} from 'vitest';
import type {CoreEngine} from '../app/engine.js';
import type {SearchEngine} from '../app/search-engine/search-engine.js';
import type {Controller} from '../controllers/controller/headless-controller.js';
import type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
} from '../ssr-next/common/types/controllers.js';

export interface MockController {
  initialState?: Record<string, unknown>;
}

export interface MockControllerDefinitionWithoutProps
  extends ControllerDefinitionWithoutProps<SearchEngine, Controller> {}

export interface MockControllerDefinitionWithProps
  extends ControllerDefinitionWithProps<
    SearchEngine,
    Controller,
    MockController
  > {}

export function buildMockController(_engine: CoreEngine): Controller {
  return {
    subscribe: vi.fn(),
    state: {},
  } as Controller;
}

export function buildMockControllerWithInitialState(
  _engine: CoreEngine,
  props: MockController
): Controller {
  return {
    state: props.initialState,
    subscribe: vi.fn(),
  } as Controller;
}

/**
 * For SSR use only.
 */
export function defineMockController(): MockControllerDefinitionWithoutProps {
  return {
    build: vi.fn((engine) => {
      return buildMockController(engine);
    }),
  };
}

/**
 * For SSR use only.
 */
export function defineMockControllerWithProps(): MockControllerDefinitionWithProps {
  return {
    buildWithProps: vi.fn((engine, props) => {
      return buildMockControllerWithInitialState(engine, {
        initialState: props?.initialState,
      });
    }),
  };
}
