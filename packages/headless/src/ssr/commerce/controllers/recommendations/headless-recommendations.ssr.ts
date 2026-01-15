import {
  buildRecommendations,
  type Recommendations,
  type RecommendationsOptions,
  type RecommendationsState,
} from '../../../../controllers/commerce/recommendations/headless-recommendations.js';
import {recommendationInternalOptionKey} from '../../types/controller-constants.js';
import type {RecommendationOnlyControllerDefinitionWithProps} from '../../types/controller-definitions.js';
import {createControllerWithKind, Kind} from '../../types/kind.js';

export type {Recommendations, RecommendationsState};

/**
 * The options for the `defineRecommendations` function.
 */
export interface DefineRecommendationsOptions
  extends Omit<RecommendationsOptions, 'productId'> {
  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  productId: string;
}

/**
 * The props for the `defineRecommendations` function.
 */
export interface DefineRecommendationsProps {
  /**
   * The options for the `Recommendations` controller.
   */
  options: DefineRecommendationsOptions;
}

export type RecommendationsDefinitionMeta = {
  [recommendationInternalOptionKey]: {} & DefineRecommendationsProps['options'];
};

export interface RecommendationsDefinition
  extends RecommendationOnlyControllerDefinitionWithProps<
    Recommendations,
    Partial<RecommendationsOptions>
  > {}

/**
 * Defines a `Recommendations` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Recommendations` properties.
 * @returns The `Recommendations` controller definition.
 * */
export function defineRecommendations(
  props: DefineRecommendationsProps
): RecommendationsDefinition & RecommendationsDefinitionMeta {
  return {
    recommendation: true,
    [recommendationInternalOptionKey]: {
      ...props.options,
    },
    buildWithProps: (
      engine,
      options: Omit<RecommendationsOptions, 'slotId'>
    ) => {
      const staticOptions = props.options;
      const controller = buildRecommendations(engine, {
        options: {...staticOptions, ...options},
      });
      return createControllerWithKind(controller, Kind.Recommendations);
    },
  };
}
