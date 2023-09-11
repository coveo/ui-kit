import {Schema, StringValue} from '@coveo/bueno';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {ProductRecommendation} from '../../../commerce.index';
import {
  fetchProductListing,
  setProductListingUrl,
} from '../../../features/product-listing/v2/product-listing-v2-actions';
import {productListingV2Reducer as productListing} from '../../../features/product-listing/v2/product-listing-v2-slice';
import {loadReducerError} from '../../../utils/errors';
import {validateOptions} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

const optionsSchema = new Schema({
  url: new StringValue({
    required: true,
    url: true,
  }),
});

export interface ProductListingOptions {
  /**
   * The URL used to retrieve the product listing.
   */
  url: string;
}

export interface ProductListingProps {
  /**
   * The initial options that should be applied to this `ProductListing` controller.
   */
  options: ProductListingOptions;
}

/**
 * The `ProductListing` controller allows the end user to configure and retrieve product listing data.
 */
export interface ProductListing extends Controller {
  /**
   * Changes the URL used to retrieve the product listing.
   * @param url - The new URL.
   */
  setUrl(url: string): void;

  /**
   * Fetches the product listing.
   */
  refresh(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `ProductListing` controller.
   */
  state: ProductListingState;
}

export interface ProductListingState {
  products: ProductRecommendation[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  url: string;
}

export type ProductListingControllerState = ProductListing['state'];

/**
 * Creates a `ProductListingController` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ProductListingController` properties.
 * @returns A `ProductListingController` controller instance.
 */
export function buildProductListing(
  engine: CommerceEngine,
  props: ProductListingProps
): ProductListing {
  if (!loadBaseProductListingReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, optionsSchema, options, 'buildProductListing');

  dispatch(
    setProductListingUrl({
      url: options.url,
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

function loadBaseProductListingReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({productListing, configuration});
  return true;
}
