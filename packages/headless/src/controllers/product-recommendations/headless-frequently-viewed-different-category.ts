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

export type FrequentlyViewedDifferentCategoryListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface FrequentlyViewedDifferentCategoryListProps {
  options?: FrequentlyViewedDifferentCategoryListOptions;
}

export type FrequentlyViewedDifferentCategoryList = ReturnType<
  typeof buildFrequentlyViewedDifferentCategoryList
>;
export type FrequentlyViewedDifferentCategoryListState =
  FrequentlyViewedDifferentCategoryList['state'];

export const buildFrequentlyViewedDifferentCategoryList = (
  engine: ProductRecommendationEngine,
  props: FrequentlyViewedDifferentCategoryListProps
) => {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildFrequentlyViewedDifferentCategoryList'
  ) as Required<FrequentlyViewedDifferentCategoryListOptions>;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'frequentViewedDifferentCategory',
    },
  });
};
