import {
  buildRecommendations,
  type Recommendations,
  type RecommendationsProps,
  type RecommendationsState,
} from '../../../../controllers/commerce/recommendations/headless-recommendations.js';
import {recommendationInternalOptionKey} from '../../types/controller-constants.js';
import type {UniversalControllerDefinition} from '../../types/controller-definitions.js';

export type {Recommendations, RecommendationsState};

export type RecommendationsDefinitionMeta = {
  [recommendationInternalOptionKey]: {} & RecommendationsProps['options'];
};

export interface RecommendationsDefinition extends UniversalControllerDefinition<Recommendations> {}

/**
 * Defines a `Recommendations` controller instance.
 * @group Definers
 *
 * @param props - The static `Recommendations` properties, such as the slot. The product that seeds the
 *  slot comes from the `productId` option of `fetchStaticState()`.
 * @returns The `Recommendations` controller definition.
 * */
export function defineRecommendations(
  props: RecommendationsProps
): RecommendationsDefinition & RecommendationsDefinitionMeta {
  return {
    search: true,
    listing: true,
    standalone: true,
    [recommendationInternalOptionKey]: {
      ...props.options,
    },
    build: (engine, {buildConfig}) =>
      buildRecommendations(engine, {
        options: {
          ...props.options,
          ...(buildConfig.productId !== undefined && {productId: buildConfig.productId}),
        },
      }),
  };
}
