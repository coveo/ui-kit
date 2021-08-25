import {fetchProductListing} from '../../features/product-listing/product-listing-actions';
import {buildController} from '../controller/headless-controller';
import {Schema, SchemaValues} from '@coveo/bueno';
import {configuration, productListing} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine';

// TODO COM-1185 - Actually add options and dispatch the updates
const optionsSchema = new Schema({});

export type ProductListingOptions = SchemaValues<typeof optionsSchema>;

export interface ProductListingProps {
  options?: ProductListingOptions;
}

export type ProductListingController = ReturnType<typeof buildProductListing>;
export type ProductListingControllerState = ProductListingController['state'];

export const buildProductListing = (
  engine: ProductListingEngine,
  _props: ProductListingProps = {}
) => {
  if (!loadBaseProductListingReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  // TODO COM-1185 - Actually add options and dispatch the updates
  /*const options = {
    ...defaultOptions,
    ...props.options,
  }

  validate(options)*/

  dispatch(fetchProductListing());

  return {
    ...controller,

    get state() {
      const {products, error, isLoading} = getState().productListing;
      return {
        products,
        error,
        isLoading,
      };
    },
  };
};

function loadBaseProductListingReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine {
  engine.addReducers({productListing, configuration});
  return true;
}
