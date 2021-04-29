import {Engine} from '../../app/headless-engine';
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

export type UserInterestRecommendationsListOptions = SchemaValues<
  typeof optionsSchema
>;

export interface UserInterestRecommendationsListProps {
  options?: UserInterestRecommendationsListOptions;
}

export type UserInterestRecommendationsList = ReturnType<
  typeof buildUserInterestRecommendationsList
>;
export type UserInterestRecommendationsListState = UserInterestRecommendationsList['state'];

export function buildUserInterestRecommendationsList(
  engine: Engine<object>,
  props: UserInterestRecommendationsListProps
) {
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildUserInterestRecommendationsList'
  ) as Required<UserInterestRecommendationsListOptions>;
  const controller = buildBaseProductRecommendationsList(engine, {
    ...props,
    options: {
      ...options,
      id: 'user',
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
