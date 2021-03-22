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
import {validateOptions} from '../../utils/validate-payload';

const optionsSchema = new Schema({
  maxNumberOfRecommendations:
    baseProductRecommendationsOptionsSchema.maxNumberOfRecommendations,
  additionalFields: baseProductRecommendationsOptionsSchema.additionalFields,
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
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildPopularBoughtRecommendationsList'
  ) as Required<PopularBoughtRecommendationsListOptions>;
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
