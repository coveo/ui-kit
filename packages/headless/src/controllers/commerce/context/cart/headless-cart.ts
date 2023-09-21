import {ArrayValue, NumberValue, RecordValue, Schema } from "@coveo/bueno";
import {validateOptions} from '../../../../utils/validate-payload';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {buildController, Controller} from '../../../controller/headless-controller';
import {loadReducerError} from '../../../../utils/errors';
import {cartReducer as cart} from '../../../../features/commerce/context/cart/cart-slice';
import {
  addCartItem,
  removeCartItem,
  setCart,
  updateCartItemQuantity
} from '../../../../features/commerce/context/cart/cart-actions';

const optionsSchema = new Schema({
  cart: new ArrayValue({
    each: new RecordValue({
      values: {
        product: new RecordValue({
          options: {required: true}
        }),
        quantity: new NumberValue({
          required: true,
          min: 1,
        })
      }
    }),
  }),
});

export interface CartOptions {
  cart?: CartItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Product {
  groupId?: string;
  productId?: string;
  sku?: string;
}

export interface CartProps {
  /**
   * The initial options that should be applied to this `Cart` controller.
   */
  options?: CartOptions;
}

/**
 * The `Cart` controller allows the end user to configure cart data.
 */
export interface Cart extends Controller {

  /**
   * Sets the cart.
   * @param cart - The new cart.
   */
  setCart(cart: CartItem[]): void;

  /**
   * Adds a cart item.
   * @param item - The new cart item.
   */
  addCartItem(item: CartItem): void;

  /**
   * Removes a cart item.
   * @param item - The cart item to remove
   */
  removeCartItem(item: CartItem): void;

  /**
   * Updates a cart item's quantity.
   * @param item - The cart item to update.
   */
  updateCartItemQuantity(item: CartItem): void;

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
 * Creates a `CartController` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `CartController` properties.
 * @returns A `CartController` controller instance.
 */
export function buildCart(
  engine: CommerceEngine,
  props: CartProps = {}
): Cart {
  if (!loadBaseCartReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, optionsSchema, options, 'buildCart');

  if (options.cart) {
    dispatch(
      setCart({
        cart: options.cart
      })
    );
  }

  return {
    ...controller,

    get state() {
      const {cart, cartItems} = getState().cart
      return {
        cart: cartItems.map((id: string) => cart[id]) as CartItem[]
      };
    },

    setCart: (cart: CartItem[]) => dispatch(setCart({cart})),

    addCartItem: (item: CartItem) => dispatch(addCartItem(item)),

    removeCartItem: (item: CartItem) => dispatch(removeCartItem(item)),

    updateCartItemQuantity: (item: CartItem) => dispatch(updateCartItemQuantity(item)),
  };
}

function loadBaseCartReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({cart});
  return true;
}
