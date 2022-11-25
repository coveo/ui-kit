import {Schema, SchemaValues} from '@coveo/bueno';
import {ProductRecommendationEngine} from '../../app/product-recommendation-engine/product-recommendation-engine';
import {validateOptions} from '../../utils/validate-payload';
import {
  baseProductRecommendationsOptionsSchema,
  buildBaseProductRecommendationsList,
} from './headless-base-product-recommendations';

const optionsSchema = new Schema({
  maxNumberOfRecommendations:
    baseProductRecommendationsOptionsSchema.maxNumberOfRecommendations,
  additionalFields: baseProductRecommendationsOptionsSchema.additionalFields,
});

export type PopularViewedRecommendationsListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface PopularViewedRecommendationsListProps {
  options?: PopularViewedRecommendationsListOptions;
}

export type PopularViewedRecommendationsList = ReturnType<
  typeof buildPopularViewedRecommendationsList
>;
export type PopularViewedRecommendationsListState =
  PopularViewedRecommendationsList['state'];

export function buildPopularViewedRecommendationsList(
  engine: ProductRecommendationEngine,
  props: PopularViewedRecommendationsListProps = {}
) {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildPopularViewedRecommendationsList'
  ) as Required<PopularViewedRecommendationsListOptions>;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'popularViewed',
    },
  });

  const {setSkus, ...rest} = controller;

  return {
    ...rest,

    get state() {
      const {skus, ...rest} = controller.state;

      return {
        ...rest,
      };
    },
  };
}
