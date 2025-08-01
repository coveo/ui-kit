import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {
  type CartActionPayload,
  emitCartActionEvent,
  emitPurchaseEvent,
  purchase,
  setItems,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions.js';
import {
  itemsSelector,
  type Transaction,
} from '../../../../features/commerce/context/cart/cart-selector.js';
import {cartReducer as cart} from '../../../../features/commerce/context/cart/cart-slice.js';
import type {CartItemWithMetadata} from '../../../../features/commerce/context/cart/cart-state.js';
import {cartSchema} from '../../../../features/commerce/context/cart/cart-validation.js';
import type {CartSection} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {validateInitialState} from '../../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';
import {
  itemSelector,
  totalPriceSelector,
  totalQuantitySelector,
} from './headless-cart-selectors.js';

export interface CartInitialState {
  items?: CartItemWithMetadata[];
}

/**
 * The shape of a cart item.
 */
export interface CartItem {
  /**
   * The unique identifier of the product.
   */
  productId: string;

  /**
   * The human-readable name of the product.
   */
  name: string;

  /**
   * The price per unit of the product.
   */
  price: number;

  /**
   * The number of units of the product in the cart.
   */
  quantity: number;
}

export interface CartProps {
  /**
   * The initial state to apply to this `Cart` controller.
   */
  initialState?: CartInitialState;
}

/**
 * The `Cart` controller exposes methods for managing the cart in a commerce interface.
 *
 * @group Buildable controllers
 * @category Cart
 */
export interface Cart extends Controller {
  /**
   * Creates, updates, or deletes an item in the cart, and emits an `ec.cartAction` analytics event if the `quantity` of
   * the item in the cart changes.
   *
   * If an item with the specified `productId`, `name` and `price` already exists in the cart:
   * - Setting `quantity` to `0` deletes the item from the cart.
   * - Setting `quantity` to a positive number updates the item.
   *
   * Otherwise:
   * - Setting `quantity` to a positive number creates the item in the cart with the specified `name`,
   * `price`, and `quantity`.
   *
   * If the specified `quantity` is equivalent to the current quantity of the item in the cart, no analytics event is
   * emitted. Otherwise, the method emits an `ec.cartAction` event with the appropriate action (`add` or `remove`).
   *
   * Note: Updating the `name` or `price` will create a new item in the cart, leaving the previous item with the same
   * `productId`, `name` and `price` unchanged. If you wish to change these items, delete and recreate the item.
   *
   * @param item - The cart item to create, update, or delete.
   */
  updateItemQuantity(item: CartItem): void;

  /**
   * Sets the quantity of each item in the cart to 0, effectively emptying the cart.
   *
   * Emits an `ec.cartAction` analytics event with the `remove` action for each item removed from the cart.
   */
  empty(): void;

  /**
   * Emits an `ec.purchase` analytics event and then empties the cart without emitting any additional events.
   *
   * @param transaction - The object with the id and the total revenue from the transaction, including taxes, shipping, and discounts.
   */
  purchase(transaction: Transaction): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Cart` controller.
   */
  state: CartState;
}

/**
 * The state of the `Cart` controller.
 *
 * @group Buildable controllers
 * @category Cart
 */
export interface CartState {
  /**
   * The items in the cart.
   */
  items: CartItem[];

  /**
   * The sum total of the `quantity` of each item in the cart.
   */
  totalQuantity: number;

  /**
   * The sum total of the `price` multiplied by the `quantity` of each item in the cart.
   */
  totalPrice: number;
}

/**
 * Creates a `Cart` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Cart` properties.
 * @returns A `Cart` controller instance.
 *
 * @group Buildable controllers
 * @category Cart
 */
export function buildCart(engine: CommerceEngine, props: CartProps = {}): Cart {
  if (!loadBaseCartReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine[stateKey].cart;

  const initialState = {
    ...props.initialState,
  };

  validateInitialState(engine, cartSchema, initialState, 'buildCart');

  // TODO: expose some helpers to facilitate storing / restoring the cart state for MPAs
  if (initialState.items !== undefined) {
    dispatch(setItems(initialState.items));
  }

  function isNewQuantityDifferent(
    currentItem: CartItem,
    prevItem: CartItemWithMetadata
  ) {
    return prevItem ? prevItem.quantity !== currentItem.quantity : true;
  }

  function getCartAction(
    currentItem: CartItem,
    prevItem: CartItemWithMetadata | undefined
  ): 'add' | 'remove' {
    const isCurrentQuantityGreater =
      !prevItem || currentItem.quantity > prevItem.quantity;
    return isCurrentQuantityGreater ? 'add' : 'remove';
  }

  function isEqual(
    currentItem: CartItem,
    prevItem: CartItemWithMetadata | undefined
  ): boolean {
    return prevItem
      ? currentItem.name === prevItem.name &&
          currentItem.price === prevItem.price &&
          currentItem.quantity === prevItem.quantity
      : false;
  }

  function createEcCartActionPayload(
    currentItem: CartItem,
    prevItem: CartItemWithMetadata | undefined
  ): CartActionPayload {
    const {quantity: currentQuantity, ...product} = currentItem;
    const action = getCartAction(currentItem, prevItem);
    const quantity = !prevItem
      ? currentQuantity
      : Math.abs(currentQuantity - prevItem.quantity);

    return {
      action,
      quantity,
      product,
    };
  }

  return {
    ...controller,

    empty: function () {
      for (const item of itemsSelector(getState())) {
        this.updateItemQuantity({...item, quantity: 0});
      }
    },

    purchase(transaction: Transaction) {
      dispatch(emitPurchaseEvent(transaction));
      dispatch(purchase());
    },

    updateItemQuantity(item: CartItem) {
      const prevItem = itemSelector(getState(), item);
      const doesNotNeedUpdate = !prevItem && item.quantity <= 0;

      if (doesNotNeedUpdate || isEqual(item, prevItem)) {
        return;
      }

      if (isNewQuantityDifferent(item, prevItem)) {
        dispatch(
          emitCartActionEvent(createEcCartActionPayload(item, prevItem))
        );
      }

      dispatch(updateItemQuantity(item));
    },

    get state() {
      const cartState = getState();

      return {
        items: itemsSelector(cartState),
        totalQuantity: totalQuantitySelector(cartState),
        totalPrice: totalPriceSelector(cartState),
      };
    },
  };
}

export type CartKey = string;

export function createCartKey(item: CartItem): CartKey {
  return `${item.productId},${item.name},${item.price}`;
}

function loadBaseCartReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CartSection> {
  engine.addReducers({cart});
  return true;
}
