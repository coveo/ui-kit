import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import type {
  BadgePlacement,
  BadgesProduct,
} from '../../../api/commerce/product-enrichment/product-enrichment-response.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {
  type FetchBadgesPayload,
  fetchBadges,
} from '../../../features/commerce/product-enrichment/product-enrichment-actions.js';
import {productEnrichmentReducer as productEnrichment} from '../../../features/commerce/product-enrichment/product-enrichment-slice.js';
import type {ProductEnrichmentSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {validateInitialState} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

/**
 * The initial state for the `ProductEnrichment` controller.
 *
 * @group Buildable controllers
 * @category ProductEnrichment
 */
export interface ProductEnrichmentInitialState {
  /**
   * An array of placement IDs to fetch badges for.
   */
  placementIds?: string[];
}

/**
 * The configuration properties for the `ProductEnrichment` controller.
 *
 * @group Buildable controllers
 * @category ProductEnrichment
 */
export interface ProductEnrichmentProps {
  /**
   * The initial state.
   */
  initialState?: ProductEnrichmentInitialState;
}

export type {FetchBadgesPayload};

const defaultProductEnrichmentState: ProductEnrichmentInitialState = {
  placementIds: [],
};

const initialStateSchema = new Schema<ProductEnrichmentInitialState>({
  placementIds: new ArrayValue({
    required: false,
    each: new StringValue({required: true, emptyAllowed: false}),
  }),
});

/**
 * The `ProductEnrichment` controller manages product badges from the product enrichment API.
 *
 * @group Buildable controllers
 * @category ProductEnrichment
 */
export interface ProductEnrichment extends Controller {
  /**
   * The state of the ProductEnrichment controller.
   * */
  state: ProductEnrichmentState;
  /**
   * Fetches badges for the configured product and placement IDs.
   *
   * @param placementIds - Optional array of placement IDs to fetch badges for. If not provided, uses the controller's configured placement IDs.
   */
  getBadges(placementIds?: string[]): void;
  /**
   * Gets badge placements for a specific product ID.
   *
   * @param productId - The product ID to get badges for.
   * @returns The badge placements for the product, or undefined if not found.
   */
  getBadgesPlacementsForProduct(
    productId: string
  ): BadgePlacement[] | undefined;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ProductEnrichment` controller.
 *
 * @group Buildable controllers
 * @category ProductEnrichment
 * */
export interface ProductEnrichmentState {
  /**
   * An array of products with their badge placements.
   */
  badges: BadgesProduct[];
  /**
   * Whether a request to fetch badges is currently being executed.
   */
  isLoading: boolean;
  /**
   * The error message if the request failed.
   */
  error: string | null;
}

function validateProductEnrichmentProps(
  engine: CommerceEngine,
  props?: ProductEnrichmentProps
) {
  validateInitialState(
    engine,
    initialStateSchema,
    props?.initialState,
    'buildProductEnrichment'
  );
}

/**
 * Creates a `ProductEnrichment` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configuration `ProductEnrichment` properties.
 * @returns A `ProductEnrichment` controller instance.
 *
 * @group Buildable controllers
 * @category ProductEnrichment
 *
 * */
export function buildProductEnrichment(
  engine: CommerceEngine,
  props?: ProductEnrichmentProps
): ProductEnrichment {
  if (!loadProductEnrichmentReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine[stateKey];

  const registrationState: ProductEnrichmentInitialState = {
    ...defaultProductEnrichmentState,
    ...props?.initialState,
  };

  validateProductEnrichmentProps(engine, {
    initialState: registrationState,
  });

  return {
    ...controller,

    get state() {
      const state = getState();
      return state.productEnrichment;
    },

    getBadges(placementIds?: string[]) {
      const idsToUse = placementIds ?? registrationState.placementIds ?? [];

      const errorMessage = new ArrayValue({
        required: true,
        min: 1,
        each: new StringValue({required: true, emptyAllowed: false}),
      }).validate(idsToUse);

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      dispatch(
        fetchBadges({
          placementIds: idsToUse,
        })
      );
    },

    getBadgesPlacementsForProduct(productId: string) {
      const state = getState();
      const product = state.productEnrichment.badges.find(
        (p) => p.productId === productId
      );
      return product?.badgePlacements;
    },
  };
}

function loadProductEnrichmentReducer(
  engine: CommerceEngine
): engine is CommerceEngine<ProductEnrichmentSection> {
  engine.addReducers({productEnrichment});
  return true;
}
