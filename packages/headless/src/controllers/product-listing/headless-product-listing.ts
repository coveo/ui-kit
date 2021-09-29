import {
  fetchProductListing,
  setAdditionalFields,
  setProductListingUrl,
} from '../../features/product-listing/product-listing-actions';
import {buildController} from '../controller/headless-controller';
import {ArrayValue, Schema, SchemaValues, StringValue} from '@coveo/bueno';
import {configuration, productListing} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine';
import {validateOptions} from '../../utils/validate-payload';

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

export type ProductListingOptions = SchemaValues<typeof optionsSchema>;

export interface ProductListingProps {
  options?: ProductListingOptions;
}

export type ProductListingController = ReturnType<typeof buildProductListing>;
export type ProductListingControllerState = ProductListingController['state'];

export const buildProductListing = (
  engine: ProductListingEngine,
  props: ProductListingProps = {}
) => {
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
};

function loadBaseProductListingReducers(
  engine: ProductListingEngine
): engine is ProductListingEngine {
  engine.addReducers({productListing, configuration});
  return true;
}
