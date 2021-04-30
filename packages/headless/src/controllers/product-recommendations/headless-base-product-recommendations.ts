import {Engine} from '../../app/headless-engine';
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
import {configuration, productRecommendations} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';

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
  engine: Engine<object>,
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
    subscribe: controller.subscribe,

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
  engine: Engine<object>
): engine is Engine<ProductRecommendationsSection & ConfigurationSection> {
  engine.addReducers({productRecommendations, configuration});
  return true;
}
