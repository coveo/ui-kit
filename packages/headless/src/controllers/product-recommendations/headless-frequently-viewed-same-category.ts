import {Schema, SchemaValues} from '@coveo/bueno';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine';
import {validateOptions} from '../../utils/validate-payload';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations';

const optionsSchema = new Schema({
  ...baseProductRecommendationsOptionsSchema,
});

export type FrequentlyViewedSameCategoryListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface FrequentlyViewedSameCategoryListProps {
  options?: FrequentlyViewedSameCategoryListOptions;
}

export type FrequentlyViewedSameCategoryList = ReturnType<
  typeof buildFrequentlyViewedSameCategoryList
>;
export type FrequentlyViewedSameCategoryListState =
  FrequentlyViewedSameCategoryList['state'];

export const buildFrequentlyViewedSameCategoryList = (
  engine: ProductRecommendationEngine,
  props: FrequentlyViewedSameCategoryListProps
) => {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyViewedSameCategoryList'
  ) as Required<FrequentlyViewedSameCategoryListOptions>;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'frequentViewedSameCategory',
    },
  });
};
