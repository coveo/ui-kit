import {Engine} from '../../app/engine';
import {
  getProductRecommendations as updateProductRecommendations,
  setProductRecommendationsSkus,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
  setProductRecommendationsAdditionalFields,
} from '../../features/product-recommendations/product-recommendations-actions';
import {
  ConfigurationSection,
  ProductRecommendationsSection,
} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {
  ArrayValue,
  NumberValue,
  Schema,
  SchemaValues,
  StringValue,
} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';

export const baseProductRecommendationsOptionsSchema = {
  additionalFields: new ArrayValue<string>({
    required: false,
    each: new StringValue({emptyAllowed: false}),
  }),
  skus: new ArrayValue<string>({
    required: false,
    each: new StringValue({emptyAllowed: false}),
  }),
  maxNumberOfRecommendations: new NumberValue({
    required: false,
    max: 50,
    min: 1,
    default: 5,
  }),
};

const optionsSchema = new Schema({
  id: new StringValue({
    required: true,
    emptyAllowed: false,
  }),
  ...baseProductRecommendationsOptionsSchema,
});

export type ProductRecommendationsListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface ProductRecommendationsListProps {
  options?: ProductRecommendationsListOptions;
}

export type ProductRecommendationsList = ReturnType<
  typeof buildBaseProductRecommendationsList
>;
export type ProductRecommendationsListState = ProductRecommendationsList['state'];

export const buildBaseProductRecommendationsList = (
  engine: Engine<ProductRecommendationsSection & ConfigurationSection>,
  props: ProductRecommendationsListProps = {}
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildBaseProductRecommendationsList'
  ) as Required<ProductRecommendationsListOptions>;
  dispatch(
    setProductRecommendationsRecommenderId({
      id: options.id,
    })
  );
  dispatch(
    setProductRecommendationsMaxNumberOfRecommendations({
      number: options.maxNumberOfRecommendations,
    })
  );
  if (options.additionalFields) {
    dispatch(
      setProductRecommendationsAdditionalFields({
        additionalFields: options.additionalFields,
      })
    );
  }
  if (options.skus) {
    dispatch(
      setProductRecommendationsSkus({
        skus: options.skus,
      })
    );
  }
  return {
    ...controller,

    setSkus(skus: string[]) {
      dispatch(setProductRecommendationsSkus({skus: skus}));
    },

    refresh() {
      dispatch(updateProductRecommendations());
    },

    get state() {
      const {
        skus,
        maxNumberOfRecommendations,
        recommendations,
        error,
        isLoading,
      } = engine.state.productRecommendations;
      return {
        skus,
        maxNumberOfRecommendations,
        recommendations,
        error,
        isLoading,
      };
    },
  };
};
