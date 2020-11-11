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

export type PopularBoughtRecommendationsListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface PopularBoughtRecommendationsListProps {
  options?: PopularBoughtRecommendationsListOptions;
}

export type PopularBoughtRecommendationsList = ReturnType<
  typeof buildPopularBoughtRecommendationsList
>;
export type PopularBoughtRecommendationsListState = PopularBoughtRecommendationsList['state'];

export const buildPopularBoughtRecommendationsList = (
  engine: Engine<ProductRecommendationsSection & ConfigurationSection>,
  props: PopularBoughtRecommendationsListProps = {}
) => {
  const options = optionsSchema.validate(props.options) as Required<
    PopularBoughtRecommendationsListOptions
  >;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'popularBought',
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
};
