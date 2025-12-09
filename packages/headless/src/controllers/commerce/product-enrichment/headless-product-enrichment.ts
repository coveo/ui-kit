import type {BadgesProduct} from '../../../api/commerce/product-enrichment/product-enrichment-response.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {productEnrichmentOptionsSchema} from '../../../features/commerce/product-enrichment/product-enrichment.js';
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

export interface ProductEnrichmentOptions {
  /**
   * An array of placement IDs to fetch badges for.
   */
  placementIds?: string[];
  /**
   * The product ID to fetch badges for.
   */
  productId?: string;
}

export interface ProductEnrichmentProps {
  /**
   * The options for the `ProductEnrichment` controller.
   */
  options?: ProductEnrichmentOptions;
}

export type {FetchBadgesPayload};

const defaultProductEnrichmentOptions: ProductEnrichmentOptions = {
  placementIds: [],
  productId: undefined,
};

export interface ProductEnrichment extends Controller {
  /**
   * The state of the ProductEnrichment controller.
   * */
  state: ProductEnrichmentState;
  /**
   * Fetches badges for the configured product and placement IDs.
   *
   */
  getBadges(): void;
}

export interface ProductEnrichmentState {
  /**
   * An array of products with their badge placements.
   */
  products: BadgesProduct[];
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
    productEnrichmentOptionsSchema,
    props?.options,
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

  const registrationOptions: ProductEnrichmentOptions = {
    ...defaultProductEnrichmentOptions,
    ...props?.options,
  };

  validateProductEnrichmentProps(engine, {
    options: props?.options,
  });

  return {
    ...controller,

    get state() {
      const state = getState();
      return state.productEnrichment;
    },

    getBadges() {
      if (
        !registrationOptions.placementIds ||
        registrationOptions.placementIds.length === 0
      ) {
        return;
      }

      dispatch(
        fetchBadges({
          placementIds: registrationOptions.placementIds,
          productId: registrationOptions.productId,
        })
      );
    },
  };
}

function loadProductEnrichmentReducer(
  engine: CommerceEngine
): engine is CommerceEngine<ProductEnrichmentSection> {
  engine.addReducers({productEnrichment});
  return true;
}
