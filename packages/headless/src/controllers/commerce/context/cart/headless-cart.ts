import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  setItems,
  updateItemMetadata,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer as cart} from '../../../../features/commerce/context/cart/cart-slice';
import {cartSchema} from '../../../../features/commerce/context/cart/cart-validation';
import {contextReducer as context} from '../../../../features/commerce/context/context-slice';
import {loadReducerError} from '../../../../utils/errors';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';

export interface CartOptions {
  items?: CartItem[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartProps {
  /**
   * The initial options that should be applied to this `Cart` controller.
   */
  options?: CartOptions;
}

/**
 * The metadata of a cart item.
 */
interface CartItemMetadata {
  /**
   * The name of the item.
   */
  name?: string;

  /**
   * The price of the item.
   */
  price?: number;
}

/**
 * The `Cart` controller exposes methods for managing the cart in a commerce interface.
 */
export interface Cart extends Controller {
  /**
   * Updates the quantity of an item in the cart, and emits an `ec.cartAction` analytics event if needed.
   *
   * If the specified `itemId` is already in the cart:
   * - Setting `quantity` to `0` will remove the item from the cart.
   * - Setting `quantity` to a positive number will update the item's quantity in the cart to the specified quantity.
   *
   * Otherwise:
   * - Setting `quantity` to a positive number will add the item to the cart with the specified quantity.
   *
   * In any case, if the specified quantity is equivalent to the current quantity of the item in the cart, no action is
   * taken.
   *
   * @param itemId - The ID of the cart item to update.
   * @param quantity - The new quantity of the cart item.
   */
  updateItemQuantity(itemId: string, quantity: number): void;

  /**
   * Updates the metadata of an item in the cart.
   *
   * @param itemId - The ID of the cart item to update.
   * @param metadata - The new metadata of the cart item.
   */
  updateItemMetadata(itemId: string, metadata: CartItemMetadata): void;

  /**
   * Sets the quantity of each item in the cart to 0, effectively emptying the cart.
   *
   * Emits an `ec.cartAction` analytics event for each item removed from the cart.
   */
  empty(): void;

  /**
   * Emits an `ec.purchase` analytics event and then empties the cart without emitting any additional events.
   *
   * @param transactionId - The transaction ID.
   * @param transactionRevenue - The total revenue from the transaction, including taxes, shipping, and discounts.
   */
  purchase(transactionId: string, transactionRevenue: number): void;

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
  cart: CartItem[];

  /**
   * The total number of items in the cart.
   */
  totalItems: number;

  /**
   * The total price of the items in the cart.
   */
  totalPrice: number;
}

export type CartControllerState = Cart['state'];

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
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, cartSchema, options, 'buildCart');

  if (options.items) {
    dispatch(setItems(options.items));
  }

  function isNewQuantityDifferent(productId: string, quantity: number) {
    const item = getState().cart.cart[productId];
    if (!item) {
      return quantity > 0;
    }

    return item.quantity !== quantity;
  }

  return {
    ...controller,

    empty: function () {
      for (const item of this.state.cart) {
        this.updateItemQuantity(item.productId, 0);
      }
    },

    purchase: (_transactionId: string, _transactionRevenue: number) => {
      // TODO: log ec.purchase with all products in cart.
      dispatch(setItems([]));
    },

    updateItemMetadata(productId: string, metadata: CartItemMetadata) {
      dispatch(updateItemMetadata({productId, ...metadata}));
    },

    updateItemQuantity: (productId: string, quantity: number) => {
      if (isNewQuantityDifferent(productId, quantity)) {
        dispatch(
          updateItemQuantity({
            productId,
            quantity,
          })
          // TODO: log ec.cartAction; if new quantity > previous, 'add', otherwise, 'remove'.
        );
      }
    },

    get state() {
      const {cart, cartItems} = getState().cart;
      const inCart = cartItems.map((id: string) => cart[id]) as CartItem[];
      const totalItems = inCart.reduce((prev, cur) => prev + cur.quantity, 0);
      const totalPrice = inCart.reduce(
        (prev, cur) => prev + cur.price * cur.quantity,
        0
      );
      return {
        cart: inCart,
        totalItems,
        totalPrice,
      };
    },
  };
}

function loadBaseCartReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({cart, context});
  return true;
}
