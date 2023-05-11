import {ArrayValue, NumberValue, Schema, SchemaValues} from '@coveo/bueno';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine';
import {productRecommendations} from '../../app/product-recommendation-reducers';
import {configuration} from '../../app/reducers';
import {
  getProductRecommendations as updateProductRecommendations,
  setProductRecommendationsSkus,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
  setProductRecommendationsAdditionalFields,
} from '../../features/product-recommendations/product-recommendations-actions';
import {loadReducerError} from '../../utils/errors';
import {
  nonEmptyString,
  requiredNonEmptyString,
  validateOptions,
} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

export const baseProductRecommendationsOptionsSchema = {
  additionalFields: new ArrayValue<string>({
    required: false,
    each: nonEmptyString,
  }),
  skus: new ArrayValue<string>({
    required: false,
    each: nonEmptyString,
  }),
  maxNumberOfRecommendations: new NumberValue({
    required: false,
    max: 50,
    min: 1,
    default: 5,
  }),
};

const optionsSchema = new Schema({
  id: requiredNonEmptyString,
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
export type ProductRecommendationsListState =
  ProductRecommendationsList['state'];

export const buildBaseProductRecommendationsList = (
  engine: ProductRecommendationEngine,
  props: ProductRecommendationsListProps = {}
) => {
  if (!loadBaseProductRecommendationsReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

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
      } = getState().productRecommendations;
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

function loadBaseProductRecommendationsReducers(
  engine: ProductRecommendationEngine
): engine is ProductRecommendationEngine {
  engine.addReducers({productRecommendations, configuration});
  return true;
}
