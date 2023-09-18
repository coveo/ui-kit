import { Schema } from "@coveo/bueno";
import {requiredNonEmptyString} from '../../../utils/validate-payload';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {buildController, Controller} from '../../controller/headless-controller';

const optionsSchema = new Schema({
  url: requiredNonEmptyString,
});

export interface User {
  userId?: string;
  email?: string;
  userIp?: string;
  userAgent?: string;
}

export interface View {
  url: string;
}

export interface Product {
  groupId?: string;
  productId?: string;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ContextOptions {
  trackingId?: string;
  language?: string;
  currency?: string;
  // TODO: Does it make sense for the clientId to be part of the context state?
  clientId?: string;
  user?: User;
  view?: Partial<View>;
  cart?: CartItem[];
  labels?: Record<string, string>
}

export interface ContextProps {
  /**
   * The initial options that should be applied to this `Context` controller.
   */
  options?: ContextOptions;
}

// TODO: Does this controller do too much? Should it expose sub-controllers which allow mutating
//  specific parts of the state?
/**
 * The `Context` controller allows the end user to configure context data.
 */
export interface Context extends Controller {
  /**
   * Sets the tracking id.
   * @param trackingId - The new tracking id.
   */
  setTrackingId(trackingId: string): void;

  /**
   * Sets the language.
   * @param language - The new language.
   */
  setLanguage(language: string): void;

  /**
   * Sets the currency.
   * @param currency - The new currency.
   */
  setCurrency(currency: string): void;

  /**
   * Sets the client id.
   * @param clientId - The new client id.
   */
  setClientId(clientId: string): void;

  /**
   * Sets the user.
   * @param user - The new user.
   */
  setUser(user: User): void;

  /**
   * Sets the view.
   * @param view - The new view.
   */
  setView(view: View): void;

  /**
   * Sets the cart.
   * @param cart - The new cart.
   */
  setCart(cart: CartItem[]): void;

  /**
   * Adds a cart item.
   * @param item - The new cart item.
   */
  addCartItem(item: CartItem): string;

  /**
   * Removes a cart item.
   * @param itemId - The cart item's id to remove.
   */
  removeCartItem(itemId: string): void;

  /**
   * Sets the labels.
   * @param labels - The new labels.
   */
  setLabels(labels: Record<string, string>): void;

  /**
   * Sets a label.
   * @param key - The label to set.
   * @param value - The label to set's value.
   */
  setLabel(key: string, value: string): string;

  /**
   * Removes a label.
   * @param label - The label to remove.
   */
  removeLabel(label: string): string;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Context` controller.
   */
  state: ContextState;
}

export interface ContextState {
  trackingId?: string;
  language?: string;
  currency?: string;
  // TODO: Does it make sense for the clientId to be part of the context state?
  clientId?: string;
  user: User;
  view: View;
  cart: CartItem[];
  labels: Record<string, string>
}

export type ContextControllerState = Context['state'];

/**
 * Creates a `ContextController` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ContextController` properties.
 * @returns A `ContextController` controller instance.
 */
export function buildContext(
  engine: CommerceEngine,
  props: ContextProps = {}
): Context {
  if (!loadBaseContextReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, optionsSchema, options, 'buildContext');

  dispatch(
    setContext({
      user: options,
    })
  );

  return {
    ...controller,

    get state() {
      const {products, error, isLoading, responseId, context} =
        getState().productListing;
      return {
        products,
        error,
        isLoading,
        responseId,
        url: context.view.url,
      };
    },

    setUrl: (url: string) =>
      dispatch(
        setProductListingUrl({
          url,
        })
      ),

    refresh: () => dispatch(fetchProductListing()),
  };
}

function loadBaseContextReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({productListing, configuration});
  return true;
}
