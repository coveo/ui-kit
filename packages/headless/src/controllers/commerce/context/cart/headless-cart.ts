import {CurrencyCodeISO4217, Ec} from '@coveo/relay-event-types';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  setItems,
  updateItem,
} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer as cart} from '../../../../features/commerce/context/cart/cart-slice';
import {CartItemWithMetadata} from '../../../../features/commerce/context/cart/cart-state';
import {cartSchema} from '../../../../features/commerce/context/cart/cart-validation';
import {loadReducerError} from '../../../../utils/errors';
import {validateInitialState} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {
  itemSelector,
  itemsSelector,
  totalPriceSelector,
  totalQuantitySelector,
} from './headless-cart-selectors';

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

/**
 * The purchase transaction.
 */
export interface Transaction {
  /**
   * The transaction's id
   */
  id: string;

  /**
   * The total revenue from the transaction, including taxes, shipping, and discounts.
   */
  revenue: number;
}

export interface CartProps {
  /**
   * The initial state to apply to this `Cart` controller.
   */
  initialState?: CartInitialState;
}

/**
 * The `Cart` controller exposes methods for managing the cart in a commerce interface.
 */
export interface Cart extends Controller {
  /**
   * Creates, updates, or deletes an item in the cart, and emits an `ec.cartAction` analytics event if the `quantity` of
   * the item in the cart changes.
   *
   * If an item with the specified `productId` already exists in the cart:
   * - Setting `quantity` to `0` deletes the item from the cart; `name` and `price` have no effect.
   * - Setting `quantity` to a positive number updates the item's `name`, `price`, and `quantity` to the
   * specified values.
   *
   * Otherwise:
   * - Setting `quantity` to a positive number creates the item in the cart with the specified `productName`,
   * `pricePerUnit`, and `quantity`.
   *
   * If the specified `quantity` is equivalent to the current quantity of the item in the cart, no analytics event is
   * emitted. Otherwise, the method emits an `ec.cartAction` event with the appropriate action (`add` or `remove`).
   *
   * @param item - The cart item to create, update, or delete.
   */
  updateItem(item: CartItem): void;

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
 */
export function buildCart(engine: CommerceEngine, props: CartProps = {}): Cart {
  if (!loadBaseCartReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state.cart;

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

  function getCurrency(): CurrencyCodeISO4217 {
    return engine.state.commerceContext.currency;
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
  ): Ec.CartAction {
    const {quantity: currentQuantity, ...product} = currentItem;
    const action = getCartAction(currentItem, prevItem);
    const quantity = !prevItem
      ? currentQuantity
      : Math.abs(currentQuantity - prevItem.quantity);
    const currency = getCurrency();

    return {
      action,
      currency,
      quantity,
      product,
    };
  }

  function createEcPurchasePayload(transaction: Transaction): Ec.Purchase {
    const currency = getCurrency();
    const products = itemsSelector(getState()).map(
      ({quantity, ...product}) => ({quantity, product})
    );

    return {
      currency,
      products,
      transaction,
    };
  }

  return {
    ...controller,

    empty: function () {
      for (const item of itemsSelector(getState())) {
        this.updateItem({...item, quantity: 0});
      }
    },

    purchase(transaction: Transaction) {
      engine.relay.emit('ec.purchase', createEcPurchasePayload(transaction));

      dispatch(setItems([]));
    },

    updateItem(item: CartItem) {
      const prevItem = itemSelector(getState(), item.productId);
      const doesNotNeedUpdate = !prevItem && item.quantity <= 0;

      if (doesNotNeedUpdate || isEqual(item, prevItem)) {
        return;
      }

      if (isNewQuantityDifferent(item, prevItem)) {
        engine.relay.emit(
          'ec.cartAction',
          createEcCartActionPayload(item, prevItem)
        );
      }

      dispatch(updateItem(item));
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

function loadBaseCartReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({cart});
  return true;
}
