import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import {ProductListingAPIErrorStatusResponse} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {configuration} from '../../app/common-reducers';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine';
import {
  fetchProductListing,
  setAdditionalFields,
  setProductListingUrl,
} from '../../features/product-listing/product-listing-actions';
import {productListingReducer as productListing} from '../../features/product-listing/product-listing-slice';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

const optionsSchema = new Schema({
  url: new StringValue({
    required: true,
    url: true,
  }),
  additionalFields: new ArrayValue<string>({
    each: new StringValue({
      emptyAllowed: false,
    }),
  }),
});

/**
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface ProductListingOptions {
  /**
   * The initial URL used to retrieve the product listing.
   */
  url: string;

  /**
   * The initial additional fields to retrieve with the product listing.
   */
  additionalFields?: string[];
}

/**
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface ProductListingProps {
  /**
   * The initial options that should be applied to this `ProductListing` controller.
   */
  options?: ProductListingOptions;
}

/**
 * The `ProductListing` controller allows the end user to configure and retrieve product listing data.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface ProductListing extends Controller {
  /**
   * Changes the current URL used to retrieve product listing.
   * @param url - The new URL.
   */
  setUrl(url: string): void;

  /**
   * Sets the additional fields to request in addition to the standard commerce fields.
   * @param additionalFields - The new additional fields.
   */
  setAdditionalFields(additionalFields: string[]): void;

  /**
   * Refreshes the product listing.
   */
  refresh(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `ProductListing` controller.
   * */
  state: ProductListingState;
}

/**
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface ProductListingState {
  products: ProductRecommendation[];
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  additionalFields: string[];
  url: string;
}

/**
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export type ProductListingControllerState = ProductListing['state'];

/**
 * Creates a `ProductListingController` controller instance.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ProductListingController` properties.
 * @returns A `ProductListingController` controller instance.
 */
export function buildProductListing(
  engine: ProductListingEngine,
  props: ProductListingProps = {}
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
      url: options.url!,
    })
  );

  if (options.additionalFields) {
    dispatch(
      setAdditionalFields({
        additionalFields: options.additionalFields,
      })
    );
  }

  return {
    ...controller,

    get state() {
      const {products, error, isLoading, responseId, additionalFields, url} =
        getState().productListing;
      return {
        products,
        error,
        isLoading,
        responseId,
        additionalFields,
        url,
      };
    },

    setUrl: (url: string) =>
      dispatch(
        setProductListingUrl({
          url,
        })
      ),

    setAdditionalFields: (additionalFields: string[]) =>
      dispatch(setAdditionalFields({additionalFields})),

    refresh: () => dispatch(fetchProductListing()),
  };
}

function loadBaseProductListingReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine {
  engine.addReducers({productListing, configuration});
  return true;
}
