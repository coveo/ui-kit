import {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/core/interface/cart/cart-types.js';
import {loadCart} from '@/src/core/interface/cart/cart-loader.js';
import {BaseController} from '@/src/core/interface/base-controller.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import {getOrCreateCartSelectors} from '@/src/core/internal/cart/cart-selectors.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class CartControllerImpl extends BaseController<CartControllerState> {
  #actions: ReturnType<typeof getOrCreateCartActions>;

  constructor(options: CartControllerOptions) {
    const {engine, stateId} = getHandleInternals(options.interface);

    loadCart(engine, stateId);

    const selectors = getOrCreateCartSelectors(stateId);
    const controllerState = createMemoizedStateSelector(
      selectors.getItems,
      (items) => ({items})
    );

    super(engine, controllerState);
    this.#actions = getOrCreateCartActions(stateId);
  }

  setItems(payload: SetCartItemsPayload): void {
    this.engine.mutate(this.#actions.setItems(payload.items));
  }

  updateItemQuantity(payload: UpdateItemQuantityPayload): void {
    this.engine.mutate(this.#actions.updateItemQuantity(payload.item));
  }
}

export const buildCartController = (
  options: CartControllerOptions
): CartController => new CartControllerImpl(options);

export interface CartController extends Controller<CartControllerState> {
  setItems(payload: SetCartItemsPayload): void;
  updateItemQuantity(payload: UpdateItemQuantityPayload): void;
}

export interface CartControllerOptions {
  interface: Supports<'search'>;
}

export interface CartControllerItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartControllerState {
  items: CartControllerItem[];
}
