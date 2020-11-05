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

export type CartRecommendationsListOptions = SchemaValues<typeof optionsSchema>;

export interface CartRecommendationsListProps {
  options?: CartRecommendationsListOptions;
}

export type CartRecommendationsList = ReturnType<
  typeof buildCartRecommendationsList
>;
export type CartRecommendationsListState = CartRecommendationsList['state'];

export const buildCartRecommendationsList = (
  engine: Engine<ProductRecommendationsSection & ConfigurationSection>,
  props: CartRecommendationsListProps
) => {
  const options = optionsSchema.validate(props.options) as Required<
    CartRecommendationsListOptions
  >;
  return buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'cart',
    },
  });
};
