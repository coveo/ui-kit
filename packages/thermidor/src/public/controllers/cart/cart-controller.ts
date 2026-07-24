import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/internal/features/cart/index.js';
import {getOrCreateCartSlice} from '@/src/internal/features/cart/index.js';
import {BaseController} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import type {Supports} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateCartActions} from '@/src/internal/features/cart/index.js';
import {getOrCreateCartSelectors} from '@/src/internal/features/cart/index.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class CartControllerImpl extends BaseController<CartControllerState> {
  #actions: ReturnType<typeof getOrCreateCartActions>;

  constructor(options: CartControllerOptions) {
    const {engine} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateCartSlice(options.interface));

    const selectors = getOrCreateCartSelectors(options.interface);
    const controllerState = createMemoizedStateSelector(selectors.getItems, (items) => ({items}));

    super(engine, controllerState);
    this.#actions = getOrCreateCartActions(options.interface);
  }

  setItems(payload: SetCartItemsPayload): void {
    this.engine.mutate(this.#actions.setItems(payload.items));
  }

  updateItemQuantity(payload: UpdateItemQuantityPayload): void {
    this.engine.mutate(this.#actions.updateItemQuantity(payload.item));
  }
}

/**
 * Creates a cart controller bound to an interface instance.
 *
 * @param options - The controller creation options.
 * @returns A cart controller.
 */
export const buildCartController = (options: CartControllerOptions): CartController =>
  new CartControllerImpl(options);

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
