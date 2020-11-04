import {Engine} from '../../app/headless-engine';
import {
  getProductRecommendations as updateProductRecommendations,
  setProductRecommendationsSkus,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
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

const optionsSchema = new Schema({
  id: new StringValue({
    required: true,
    emptyAllowed: false,
  }),
  skus: new ArrayValue<string>({
    required: true,
    min: 1,
    each: new StringValue({emptyAllowed: false}),
  }),
  maxNumberOfRecommendations: new NumberValue({
    required: false,
    max: 50,
    default: 5,
  }),
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
  const options = optionsSchema.validate(props.options) as Required<
    ProductRecommendationsListOptions
  >;
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
  dispatch(
    setProductRecommendationsSkus({
      skus: options.skus!,
    })
  );
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
