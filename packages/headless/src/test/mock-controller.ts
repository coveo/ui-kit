import {vi} from 'vitest';
import type {CoreEngine, CoreEngineNext} from '../app/engine.js';
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
