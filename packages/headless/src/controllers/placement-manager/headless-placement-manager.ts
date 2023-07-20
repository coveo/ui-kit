import {
  ArrayValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {CommercePlacementsEngine} from '../../app/commerce-placement-engine/commerce-placement-engine';
import {
  setCartSkus,
  setImplementationId,
  setLocale,
  setOrderSkus,
  setPlpSkus,
  setProductSku,
  setRecsSkus,
  setSearchSkus,
  setView,
} from '../../features/placement-set/placement-set-action';
import '../../features/placement-set/placement-set-interface';
import {placementSetReducer} from '../../features/placement-set/placement-set-slice';
import {PlacementSetState} from '../../features/placement-set/placement-set-state';
import {loadReducerError} from '../../utils/errors';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {validateOptions} from '../../utils/validate-payload';
import {Controller, buildController} from '../controller/headless-controller';
import {PlacementViewType} from '../placement-recommendations/headless-placement-recommendations-options';

export interface PlacementManagerOptions {
  /**
   * The unique identifier of the implementation to request Placement content for.
   */
  implementationId?: string;
  /**
   * The product SKUs to use as seeds when requesting Placement content.
   */
  skus?: PlacementManagerSkusOptions;
  /**
   * The view context to pass when requesting Placement content.
   */
  view: PlacementManagerViewOptions;
}

export interface PlacementManagerViewOptions {
  /**
   * The code of the currency used in the view (e.g., `'USD'`).
   */
  currency: string;
  /**
   * The code of the language-country used in the view (e.g., `'en-us'`).
   */
  locale: string;
  /**
   * The list of subtypes that further define the view (e.g., `['women', 'dresses']`)
   */
  subtypes?: string[];
  /**
   * The view type (e.g., `CATEGORY`).
   */
  type?: PlacementViewType;
}

export interface PlacementManagerSkusOptions {
  /**
   * The SKUs of the products in the user's cart.
   */
  cart?: string[];
  /**
   * The SKUs of the products being displayed in the checkout or confirmation page.
   *
   * Only meaningful when the view `type` is `CHECKOUT` or `CONFIRMATION`.
   */
  order?: string[];
  /**
   * The SKUs of the products being displayed in a product listing page (PLP).
   *
   * Only meaningful when view `type` is `CATEGORY`.
   */
  plp?: string[];
  /**
   * The SKU of the product being displayed in a product description page (PLP).
   *
   * Only meaningful when view `type` is `PRODUCT`
   */
  product?: string;
  /**
   * The SKUs of the recommendations being displayed in the page.
   */
  recs?: string[];
  /**
   * The SKUs of the products being displayed as search results.
   *
   * Only meaningful when view `type` is `SEARCH`.
   */
  search?: string[];
}

const placementManagerSkusOptionDefinitions: SchemaDefinition<PlacementManagerSkusOptions> =
  {
    cart: new ArrayValue({each: nonEmptyString}),
    order: new ArrayValue({each: nonEmptyString}),
    plp: new ArrayValue({each: nonEmptyString}),
    product: nonEmptyString,
    recs: new ArrayValue({each: nonEmptyString}),
    search: new ArrayValue({each: nonEmptyString}),
  };

const placementManagerViewOptionDefinitions: SchemaDefinition<PlacementManagerViewOptions> =
  {
    currency: requiredNonEmptyString,
    locale: requiredNonEmptyString,
    type: new StringValue<PlacementViewType>({required: true}),
    subtypes: new ArrayValue({each: nonEmptyString}),
  };

export const optionsSchema = new Schema<Required<PlacementManagerOptions>>({
  implementationId: nonEmptyString,
  skus: new RecordValue({values: placementManagerSkusOptionDefinitions}),
  view: new RecordValue({values: placementManagerViewOptionDefinitions}),
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

export interface PlacementManager extends Controller {
  /**
   * The state of the `PlacementManager` controller.
   */
  state: PlacementSetState;

  /**
   * Sets the SKUs of the products that are currently in the user's cart.
   *
   * @param skus - The SKUs of the products in the user's cart.
   */
  setCartSkus(skus: string[]): void;

  /**
   * Sets the SKUs of the products that are currently displayed to the user in an order checkout or confirmation view.
   *
   * **Note:** PLP SKUs are automatically set to `[]` when the Placement set view type is set to anything else than
   * `CHECKOUT` or `CONFIRMATION`.
   *
   * @param skus - The SKUs of the products in the transaction confirmation or checkout.
   */
  setOrderSkus(skus: string[]): void;

  /**
   * Sets the SKUs of products that are currently displayed to the user in a product listing page (PLP) view.
   *
   * **Note:** PLP SKUs are automatically set to `[]` when the Placement set view type is set to anything else than
   * `PLP`.
   *
   * @param skus - The SKUs of the products in the product listing page.
   */
  setPlpSkus(skus: string[]): void;

  /**
   * Sets the SKU of the product that is currently displayed to the user in a product details page (PDP) view.
   *
   * **Note:** The product SKU is automatically set to `undefined` when the Placement set view type is set to anything
   * else than `PDP`
   *
   * @param sku - The SKU of the product in the product details page.
   */
  setProductSku(sku: string | null): void;

  /**
   * Sets the SKUs of the products that are currently displayed as recommendations to the user.
   *
   * @param skus - The SKUs of the products that are currently recommended to the user.
   */
  setRecsSkus(skus: string[]): void;

  /**
   * Sets the SKUs of the products that are currently displayed to the user as search query results.
   *
   * **Note:** PLP SKUs are automatically set to `[]` when the Placement set view type is set to anything else than
   * `SEARCH`.
   *
   * @param skus - The SKUs of the products that are currently shown as search results.
   */
  setSearchSkus(skus: string[]): void;

  /**
   * Sets details about the current locale.
   *
   * @param currency - The code of the currency used in the view (e.g., `'USD'`).
   * @param locale - The code of the language-country used in the view (e.g., `'en-us'`).
   */
  setLocale(currency: string, locale: string): void;

  /**
   * Sets details about the commerce application / site section that will receive content from Placements in this set.
   *
   * @param type - The view type (e.g., `CATEGORY`).
   * @param subtypes - The list of subtypes that further define the view (e.g., `['women', 'dresses']`)
   */
  setView(type: PlacementViewType, subtypes?: string[]): void;
}

/**
 * Creates a new PlacementManager instance.
 *
 * @param engine The engine
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

  options.skus?.cart && options.skus.cart.length > 0
    ? dispatch(setCartSkus({skus: options.skus.cart}))
    : {};

  options.skus?.recs && options.skus.recs.length > 0
    ? dispatch(setRecsSkus({skus: options.skus.recs}))
    : {};

  switch (options.view.type) {
    case 'category':
      // TODO log a warning if plpSkus is undefined or empty
      options.skus?.plp && options.skus.plp.length > 0
        ? dispatch(setPlpSkus({skus: options.skus.plp}))
        : {};
      break;
    case 'checkout':
    case 'confirmation':
      // TODO log a warning if orderSkus is undefined or empty
      options.skus?.order && options.skus.order.length > 0
        ? dispatch(setOrderSkus({skus: options.skus.order}))
        : {};
      break;
    case 'product':
      // TODO log a warning if productSku is undefined
      options.skus?.product
        ? dispatch(setProductSku(options.skus.product))
        : {};
      break;
    default:
      break;
  }

  dispatch(
    setLocale({currency: options.view.currency, locale: options.view.locale})
  );

  dispatch(
    setView({
      type: options.view.type ?? null,
      subtype: options.view.subtypes ?? [],
    })
  );

  return {
    ...controller,

    get state() {
      return getState().placement;
    },

    setCartSkus(skus: string[]) {
      dispatch(setCartSkus({skus: skus}));
    },

    setOrderSkus(skus: string[]) {
      dispatch(setOrderSkus({skus: skus}));
    },

    setPlpSkus(skus: string[]) {
      dispatch(setPlpSkus({skus: skus}));
    },

    setProductSku(sku: string) {
      dispatch(setProductSku(sku));
    },

    setRecsSkus(skus: string[]) {
      dispatch(setRecsSkus({skus: skus}));
    },

    setSearchSkus(skus: string[]) {
      dispatch(setSearchSkus({skus: skus}));
    },

    setLocale(currency: string, locale: string) {
      dispatch(setLocale({currency: currency, locale: locale}));
    },

    setView(type: PlacementViewType, subtypes?: string[]) {
      dispatch(setView({type: type, subtype: subtypes ?? []}));
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
