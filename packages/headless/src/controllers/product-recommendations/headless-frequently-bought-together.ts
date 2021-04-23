import {Engine} from '../../app/engine';
import {Schema, SchemaValues, StringValue} from '@coveo/bueno';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations';
import {validateOptions} from '../../utils/validate-payload';

const optionsSchema = new Schema({
  sku: new StringValue({required: true, emptyAllowed: false}),
  maxNumberOfRecommendations:
    baseProductRecommendationsOptionsSchema.maxNumberOfRecommendations,
  additionalFields: baseProductRecommendationsOptionsSchema.additionalFields,
});

export type FrequentlyBoughtTogetherListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface FrequentlyBoughtTogetherListProps {
  options?: FrequentlyBoughtTogetherListOptions;
}

export type FrequentlyBoughtTogetherList = ReturnType<
  typeof buildFrequentlyBoughtTogetherList
>;
export type FrequentlyBoughtTogetherListState = FrequentlyBoughtTogetherList['state'];

export const buildFrequentlyBoughtTogetherList = (
  engine: Engine<object>,
  props: FrequentlyBoughtTogetherListProps
) => {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyBoughtTogetherList'
  ) as Required<FrequentlyBoughtTogetherListOptions>;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      maxNumberOfRecommendations: options.maxNumberOfRecommendations,
      additionalFields: options.additionalFields,
      skus: [options.sku],
      id: 'frequentBought',
    },
  });

  const {setSkus, ...rest} = controller;

  return {
    ...rest,

    setSku(sku: string) {
      setSkus([sku]);
    },

    get state() {
      const {skus, ...rest} = controller.state;

      return {
        ...rest,
        sku: skus[0],
      };
    },
  };
};
