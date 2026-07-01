import {describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  type Engine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {
  ENGINE,
  STATE_ID,
  SOURCE_ENGINE,
  KIND,
  TYPE,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendInterfacesSlice} from '@/src/core/internal/backend-interfaces/backend-interfaces-slice.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ConverseController} from '../converse/converse-controller.js';
import {buildBackendInteractiveProductController} from './backend-interactive-product-controller.js';

const TEST_ID = 'test-gen';

function createTestGenerativeInterface(engine: Engine): GenerativeInterface {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(getOrCreateBackendInterfacesSlice(TEST_ID));
  return Object.freeze({
    [KIND]: 'interface' as const,
    [TYPE]: 'generative' as const,
    [STATE_ID]: TEST_ID,
    [ENGINE]: fullEngine,
    [SOURCE_ENGINE]: engine,
    [FACADE_RESOLVERS]: {conversation: () => ({}) as any},
  }) as unknown as GenerativeInterface;
}

function createMockConverseController(): ConverseController {
  return {
    submit: vi.fn(),
    sendAction: vi.fn(),
    selectTurn: vi.fn(),
    retry: vi.fn(),
    restoreSession: vi.fn(),
    state: {
      turns: [],
      activeTurnId: undefined,
      activeTurn: undefined,
      isStreaming: false,
      conversationSessionId: undefined,
      conversationToken: undefined,
    },
    subscribe: vi.fn(() => () => {}),
  };
}

describe('buildBackendInteractiveProductController', () => {
  it('select sends product_click action', () => {
    const engine = createTestEngine();
    const generativeInterface = createTestGenerativeInterface(engine);
    const converseController = createMockConverseController();

    const controller = buildBackendInteractiveProductController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      product: {productId: 'sku-1', name: 'Nike Air Max', price: 129.99},
      position: 3,
    });

    controller.select();

    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'product_click',
      interfaceId: 'ui-1',
      productId: 'sku-1',
      name: 'Nike Air Max',
      price: 129.99,
      position: 3,
    });
  });

  it('select only sends once (debounced)', () => {
    const engine = createTestEngine();
    const generativeInterface = createTestGenerativeInterface(engine);
    const converseController = createMockConverseController();

    const controller = buildBackendInteractiveProductController({
      interface: generativeInterface,
      converseController,
      interfaceId: 'ui-1',
      product: {productId: 'sku-1', name: 'Test', price: 10},
      position: 1,
    });

    controller.select();
    controller.select();
    controller.select();

    expect(converseController.sendAction).toHaveBeenCalledTimes(1);
  });
});
