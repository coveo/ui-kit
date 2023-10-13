import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  addItem,
  removeItem,
  setItems,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer as cart} from '../../../../features/commerce/context/cart/cart-slice';
import {cartSchema} from '../../../../features/commerce/context/cart/cart-validation';
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
  quantity: number;
}

export interface CartProps {
  /**
   * The initial options that should be applied to this `Cart` controller.
   */
  options?: CartOptions;
}

/**
 * The `Cart` controller exposes methods for managing the cart in a commerce interface.
 */
export interface Cart extends Controller {
  /**
   * Replaces the cart items.
   * @param items - The new cart items.
   */
  setItems(items: CartItem[]): void;

  /**
   * Adds a cart item.
   * @param item - The new cart item.
   */
  addItem(item: CartItem): void;

  /**
   * Removes a cart item.
   * @param productId - The cart item's product id to remove
   */
  removeItem(productId: string): void;

  /**
   * Updates the quantity of a cart item.
   * @param productId - The cart item's product id to update.
   * @param quantity - The cart item's new quantity.
   */
  updateItemQuantity(productId: string, quantity: number): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Cart` controller.
   */
  state: CartState;
}

export interface CartState {
  cart: CartItem[];
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

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, cartSchema, options, 'buildCart');

  if (options.items) {
    dispatch(setItems(options.items));
  }

  return {
    ...controller,

    get state() {
      const {cart, cartItems} = getState().cart;
      return {
        cart: cartItems.map((id: string) => cart[id]) as CartItem[],
      };
    },

    setItems: (items: CartItem[]) => dispatch(setItems(items)),

    addItem: (item: CartItem) => dispatch(addItem(item)),

    removeItem: (productId: string) => dispatch(removeItem(productId)),

    updateItemQuantity: (productId: string, quantity: number) =>
      dispatch(
        updateItemQuantity({
          productId,
          quantity,
        })
      ),
  };
}

function loadBaseCartReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({cart});
  return true;
}
