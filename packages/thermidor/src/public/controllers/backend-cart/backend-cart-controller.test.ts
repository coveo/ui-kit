import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {type Engine} from '@/src/core/interface/engine/engine.js';
import type {ConverseController} from '../converse/converse-controller.js';
import {buildBackendCartController} from './backend-cart-controller.js';

function createMockConverseController(): ConverseController {
  return {
    submit: vi.fn(),
    sendAction: vi.fn(),
    selectTurn: vi.fn(),
    retry: vi.fn(),
    state: {
      turns: [],
      activeTurnId: undefined,
      activeTurn: undefined,
      isStreaming: false,
    },
    subscribe: vi.fn(() => () => {}),
  };
}

describe('buildBackendCartController', () => {
  let engine: Engine;
  let converseController: ConverseController;

  beforeEach(() => {
    engine = createTestEngine();
    converseController = createMockConverseController();
  });

  it('starts with empty items', () => {
    const controller = buildBackendCartController({
      interface: {} as any,
      converseController,
    });

    expect(controller.state.items).toEqual([]);
  });

  it('updateItemQuantity adds item and sends cart_action add', () => {
    const controller = buildBackendCartController({
      interface: {} as any,
      converseController,
    });

    controller.updateItemQuantity({
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 2,
    });

    expect(controller.state.items).toEqual([
      {productId: 'sku-1', name: 'Shoe', price: 99, quantity: 2},
    ]);
    expect(converseController.sendAction).toHaveBeenCalledWith({
      type: 'cart_action',
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 2,
      action: 'add',
    });
  });

  it('updateItemQuantity with quantity 0 removes item and sends cart_action remove', () => {
    const controller = buildBackendCartController({
      interface: {} as any,
      converseController,
    });

    controller.updateItemQuantity({
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 2,
    });

    controller.updateItemQuantity({
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 0,
    });

    expect(controller.state.items).toEqual([]);
    expect(converseController.sendAction).toHaveBeenLastCalledWith({
      type: 'cart_action',
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 0,
      action: 'remove',
    });
  });

  it('updateItemQuantity updates existing item quantity', () => {
    const controller = buildBackendCartController({
      interface: {} as any,
      converseController,
    });

    controller.updateItemQuantity({
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 1,
    });

    controller.updateItemQuantity({
      productId: 'sku-1',
      name: 'Shoe',
      price: 99,
      quantity: 3,
    });

    expect(controller.state.items).toEqual([
      {productId: 'sku-1', name: 'Shoe', price: 99, quantity: 3},
    ]);
  });
});
