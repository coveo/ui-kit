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
  maxNumberOfRecommendations:
    baseProductRecommendationsOptionsSchema.maxNumberOfRecommendations,
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
export type PopularViewedRecommendationsListState = PopularViewedRecommendationsList['state'];

export const buildPopularViewedRecommendationsList = (
  engine: Engine<ProductRecommendationsSection & ConfigurationSection>,
  props: PopularViewedRecommendationsListProps = {}
) => {
  const options = optionsSchema.validate(props.options) as Required<
    PopularViewedRecommendationsListOptions
  >;
  const {setSkus, state, ...controller} = buildBaseProductRecommendationsList(
    engine,
    {
      ...props,
      options: {
        ...options,
        id: 'popularViewed',
      },
    }
  );

  return {
    ...controller,

    get state() {
      const {skus, ...rest} = state;

      return {
        ...rest,
      };
    },
  };
};
