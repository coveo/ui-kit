import {Engine} from '../../app/headless-engine';
import {
  ConfigurationSection,
  ProductRecommendationsSection,
} from '../../state/state-sections';
import {Schema, SchemaValues} from '@coveo/bueno';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations';

const optionsSchema = new Schema({
  ...baseProductRecommendationsOptionsSchema,
});

export type FrequentlyViewedTogetherListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface FrequentlyViewedTogetherListProps {
  options?: FrequentlyViewedTogetherListOptions;
}

export type FrequentlyViewedTogetherList = ReturnType<
  typeof buildFrequentlyViewedTogetherList
>;
export type FrequentlyViewedTogetherListState = FrequentlyViewedTogetherList['state'];

export const buildFrequentlyViewedTogetherList = (
  engine: Engine<ProductRecommendationsSection & ConfigurationSection>,
  props: FrequentlyViewedTogetherListProps
) => {
  const options = optionsSchema.validate(props.options) as Required<
    FrequentlyViewedTogetherListOptions
  >;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'frequentViewed',
    },
  });
};
