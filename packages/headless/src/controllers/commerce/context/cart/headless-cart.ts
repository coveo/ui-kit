import {validateOptions} from '../../../../utils/validate-payload';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {loadReducerError} from '../../../../utils/errors';
import {cartReducer as cart} from '../../../../features/commerce/context/cart/cart-slice';
import {
  addItem,
  removeItem,
  setItems,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions';
import {cartSchema} from '../../../../features/commerce/context/cart/cart-validation';

export interface CartOptions {
  cart?: CartItem[];
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
   * Sets the cart items.
   * @param cart - The new cart.
   */
  setItems(cart: CartItem[]): void;

  /**
   * Adds a cart item.
   * @param item - The new cart item.
   */
  addItem(item: CartItem): void;

  /**
   * Removes a cart item.
   * @param item - The cart item to remove
   */
  removeItem(item: CartItem): void;

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

  if (options.cart) {
    dispatch(
      setItems({
        cart: options.cart,
      })
    );
  }

  return {
    ...controller,

    get state() {
      const {cart, cartItems} = getState().cart;
      return {
        cart: cartItems.map((id: string) => cart[id]) as CartItem[],
      };
    },

    setItems: (cart: CartItem[]) => dispatch(setItems({cart})),

    addItem: (item: CartItem) => dispatch(addItem(item)),

    removeItem: (item: CartItem) => dispatch(removeItem(item)),

    updateItemQuantity: (productId: string, quantity: number) =>
      dispatch(updateItemQuantity({
        productId,
        quantity,
      })),
  };
}

function loadBaseCartReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({cart});
  return true;
}
