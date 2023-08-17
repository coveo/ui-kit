import {ArrayValue, Schema, StringValue, EnumValue} from '@coveo/bueno';
import {ProductListingAPIErrorStatusResponse} from '../../api/commerce/product-listings/product-listing-api-client';
import {configuration} from '../../app/common-reducers';
import {
  ProductListingEngine,
  ProductListingV2Engine,
} from '../../app/product-listing-engine/product-listing-engine';
import {
  fetchProductListing,
  fetchProductListingV2,
  setAdditionalFields,
  setProductListingId,
  setProductListingUrl,
} from '../../features/product-listing/product-listing-actions';
import {
  productListingReducer as productListing,
  productListingV2Reducer as productListingV2,
} from '../../features/product-listing/product-listing-slice';
import {ProductRecommendation} from '../../product-listing.index';
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

export enum Mode {
  Live = 'live',
  Sample = 'sample',
}

const optionsV2Schema = new Schema({
  id: new StringValue({
    required: true,
    emptyAllowed: false,
  }),
  locale: new StringValue({
    required: true,
    emptyAllowed: false,
  }),
  mode: new EnumValue<Mode>({
    enum: Mode,
    required: true,
  }),
});

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

export interface ProductListingProps {
  /**
   * The initial options that should be applied to this `ProductListing` controller.
   */
  options?: ProductListingOptions;
}

export interface ProductListingV2Options {
  id: string;
  locale: string;
  mode: string;
}

export interface ProductListingV2Props {
  /**
   * The initial options that should be applied to this `ProductListingV2` controller.
   */
  options?: ProductListingV2Options;
}

/**
 * The `ProductListing` controller allows the end user to configure and retrieve product listing data.
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
 * The `ProductListing` controller allows the end user to configure and retrieve product listing data.
 */
export interface ProductListingV2 extends Controller {
  /**
   * Changes the current id used to retrieve product listing.
   * @param id - The new id.
   */
  setId(id: string): void;

  /**
   * Refreshes the product listing.
   */
  refresh(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `ProductListingV2` controller.
   * */
  state: ProductListingV2State;
}

export interface ProductListingState {
  products: ProductRecommendation[];
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  additionalFields: string[];
  url: string;
}

export interface ProductListingV2State {
  products: ProductRecommendation[];
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  listingId: string;
}

export type ProductListingControllerState = ProductListing['state'];

/**
 * Creates a `ProductListingController` controller instance.
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

export function buildProductListingV2(
  engine: ProductListingV2Engine,
  props: ProductListingV2Props = {}
): ProductListingV2 {
  if (!loadBaseProductListingV2Reducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, optionsV2Schema, options, 'buildProductListingV2');

  dispatch(
    setProductListingId({
      id: options.id!,
    })
  );

  return {
    ...controller,

    get state() {
      const {listingId, products, error, isLoading, responseId} =
        getState().productListing;
      return {
        listingId,
        products,
        error,
        isLoading,
        responseId,
      };
    },

    setId: (id: string) =>
      dispatch(
        setProductListingId({
          id,
        })
      ),

    refresh: () => dispatch(fetchProductListingV2()),
  };
}

function loadBaseProductListingReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine {
  engine.addReducers({productListing, configuration});
  return true;
}

function loadBaseProductListingV2Reducers(
  engine: ProductListingV2Engine
): engine is ProductListingV2Engine {
  engine.addReducers({productListingV2, configuration});
  return true;
}
