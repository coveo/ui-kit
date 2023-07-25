import {Schema} from '@coveo/bueno';
import {CommercePlacementsEngine} from '../../app/commerce-placement-engine/commerce-placement-engine';
import {
  setImplementationId,
  setLocale,
  setPlacementContext,
  setSkus,
} from '../../features/placement-set/placement-set-action';
import '../../features/placement-set/placement-set-interface';
import {
  PlacementSetSkus,
  PlacementSetView,
} from '../../features/placement-set/placement-set-interface';
import {placementSetReducer} from '../../features/placement-set/placement-set-slice';
import {PlacementSetState} from '../../features/placement-set/placement-set-state';
import {loadReducerError} from '../../utils/errors';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {validateOptions} from '../../utils/validate-payload';
import {Controller, buildController} from '../controller/headless-controller';

export interface PlacementManagerOptions {
  /**
   * The code of the currency used in the view (e.g., `'USD'`).
   */
  currency: string;

  /**
   * The unique identifier of the implementation to request Placement content for.
   */
  implementationId?: string;

  /**
   * The code of the language-country used in the view (e.g., `'en-us'`).
   */
  locale: string;
}

export const optionsSchema = new Schema<Required<PlacementManagerOptions>>({
  currency: requiredNonEmptyString,
  implementationId: nonEmptyString,
  locale: requiredNonEmptyString,
});

/**
 * Props
 */
export interface PlacementManagerProps {
  /**
   * The initial options to apply to the `PlacementManager` controller.
   */
  options: PlacementManagerOptions;
}

export interface PlacementManagerState {
  /**
   * The implementation ID
   */
  implementationId: string;

  /**
   * The current Placement SKU context.
   */
  skus: PlacementSetSkus;

  /**
   * The current Placement view context.
   */
  view: PlacementSetView;
}

export interface PlacementManager extends Controller {
  /**
   * The state of the `PlacementManager` controller.
   */
  state: PlacementManagerState;

  /**
   * Replaces the SKUs in the recommendations Placement context with the specified ones.
   *
   * You can clear the recommendations Placement context by calling this method with an empty array (`[]`).
   *
   * @param recommendedSkus The product SKUs to set in the recommendations Placement context.
   */
  setRecommendationSkus(recommendedSkus: string[]): void;

  /**
   * Replaces the SKUs in the cart Placement context with the specified ones. Also updates the order context
   * accordingly if the active view warrants it.
   *
   * Call this method with an empty array (`[]`) when the user's cart is cleared, or call it with a set of SKUs to
   * initialize the cart Placement context.
   *
   * @param skusInCart The product SKUs to set in the cart Placement context.
   */
  setCartSkus(skusInCart: string[]): void;

  /**
   * Sets details about the current locale.
   *
   * @param currency - The code of the currency used in the view (e.g., `'USD'`).
   * @param locale - The code of the language-country used in the view (e.g., `'en-us'`).
   */
  setLocale(currency: string, locale: string): void;

  /**
   * Sets the Placement context to represent an active cart page view.
   *
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active cart page view,
   * if applicable.
   */
  useCartViewContext(recommendationSkus?: string[]): void;

  /**
   * Sets the Placement context to represent an active checkout page view.
   *
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active checkout page view,
   * if applicable.
   */
  useCheckoutViewContext(recommendationSkus?: string[]): void;

  /**
   * Sets the Placement context to represent an active home page view.
   *
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active home page view, if
   * applicable.
   */
  useHomeViewContext(recommendationSkus?: string[]): void;

  /**
   * Sets the Placement context to represent an active order confirmation page view.
   *
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active order confirmation
   * page view, if applicable.
   */
  useConfirmationViewContext(recommendationSkus?: string[]): void;

  /**
   * Sets the Placement context to represent an active product description page (PDP) view.
   *
   * @param productSku The SKU of the product featured in the active PDP view.
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active PDP view, if
   * applicable.
   */
  usePdpViewContext(productSku: string, recommendationSkus?: string[]): void;

  /**
   * Sets the Placement context to represent an active product listing page (PLP) view.
   *
   * @param productSkus The SKUs of the products displayed in the active PLP view.
   * @param categories The product categories that apply to the active PLP view, if applicable (e.g.,
   * `['clothing', 'rashguard']`).
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active PLP view, if
   * applicable.
   */
  usePlpViewContext(
    productSkus: string[],
    categories?: string[],
    recommendationSkus?: string[]
  ): void;

  /**
   * Sets the Placement context to represent an active search view.
   *
   * @param resultIds The permanent IDs of the results displayed in the active search view.
   * @param recommendationSkus The SKUs of the products displayed as recommendations in the active search view, if
   * applicable.
   */
  useSearchViewContext(
    resultIds: string[],
    recommendationSkus?: string[]
  ): void;
}

/**
 * Creates a new PlacementManager instance.
 *
 * @param engine The commerce Placement engine.
 * @param props The props
 * @returns The controller
 */
export function buildPlacementManager(
  engine: CommercePlacementsEngine,
  props: PlacementManagerProps
): PlacementManager {
  if (!loadPlacementSetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, optionsSchema, options, 'buildPlacementManager');

  options.implementationId
    ? dispatch(setImplementationId(options.implementationId))
    : {};

  dispatch(setLocale({currency: options.currency, locale: options.locale}));

  return {
    ...controller,

    get state() {
      return getState().placement;
    },

    setCartSkus(skusInCart: string[]) {
      const newOrderSkus =
        this.state.view.type === 'checkout' ||
        this.state.view.type === 'confirmation'
          ? skusInCart
          : [];
      dispatch(
        setSkus({
          cart: skusInCart,
          order: newOrderSkus,
          plp: this.state.skus.plp,
          recs: this.state.skus.recs,
          search: this.state.skus.search,
          product: this.state.skus.product ?? 'temp',
        })
      );
    },

    setRecommendationSkus(recommendedSkus: string[]) {
      dispatch(
        setSkus({
          cart: this.state.skus.cart,
          order: this.state.skus.order,
          plp: this.state.skus.plp,
          recs: recommendedSkus,
          search: this.state.skus.search,
          product: this.state.skus.product ?? 'temp',
        })
      );
    },

    setLocale(currency: string, locale: string) {
      dispatch(setLocale({currency: currency, locale: locale}));
    },

    useCartViewContext(recommendationSkus?: string[]) {
      dispatch(
        setPlacementContext({
          type: 'basket',
          subtype: [],
          cart: this.state.skus.cart,
          order: [],
          plp: [],
          recs: recommendationSkus ?? [],
          search: [],
          product: 'temp',
        })
      );
    },

    useCheckoutViewContext(recommendationSkus?: string[]) {
      dispatch(
        setPlacementContext({
          type: 'checkout',
          subtype: [],
          cart: this.state.skus.cart,
          order: this.state.skus.cart,
          plp: [],
          recs: recommendationSkus ?? [],
          search: [],
          product: 'temp',
        })
      );
    },

    useConfirmationViewContext(recommendationSkus?: string[]) {
      dispatch(
        setPlacementContext({
          type: 'confirmation',
          subtype: [],
          cart: this.state.skus.cart,
          order: this.state.skus.cart,
          plp: [],
          recs: recommendationSkus ?? [],
          search: [],
          product: 'temp',
        })
      );
    },

    useHomeViewContext(recommendationSkus?: string[]) {
      dispatch(
        setPlacementContext({
          type: 'home',
          subtype: [],
          cart: this.state.skus.cart,
          order: [],
          plp: [],
          recs: recommendationSkus ?? [],
          search: [],
          product: 'temp',
        })
      );
    },

    usePdpViewContext(sku: string, recommendationSkus?: string[]) {
      dispatch(
        setPlacementContext({
          type: 'product',
          subtype: [],
          cart: this.state.skus.cart,
          order: [],
          plp: [],
          recs: recommendationSkus ?? [],
          search: [],
          product: sku,
        })
      );
    },

    usePlpViewContext(
      productSkus: string[],
      categories?: string[],
      recommendationSkus?: string[]
    ) {
      dispatch(
        setPlacementContext({
          type: 'category',
          subtype: categories ?? [],
          cart: this.state.skus.cart,
          order: [],
          plp: productSkus,
          recs: recommendationSkus ?? [],
          search: [],
          product: 'temp',
        })
      );
    },

    useSearchViewContext(resultIds: string[], recommendationSkus?: string[]) {
      dispatch(
        setPlacementContext({
          type: 'search',
          subtype: [],
          cart: this.state.skus.cart,
          order: [],
          plp: [],
          recs: recommendationSkus ?? [],
          search: resultIds,
          product: 'temp',
        })
      );
    },
  };
}

function loadPlacementSetReducers(
  engine: CommercePlacementsEngine
): engine is CommercePlacementsEngine<PlacementSetState> {
  engine.addReducers({
    placementSetReducer,
  });
  return true;
}
