import {RecommendationOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {RecommendationsState} from '../recommendations/headless-recommendations.js';
import {
  RecommendationsProps,
  Recommendations,
  buildRecommendations,
} from './headless-recommendations.js';

export type {Recommendations, RecommendationsState};

/**
 * @internal
 * */
export type RecommendationsDefinitionMeta = {
  _recommendationProps: {} & RecommendationsProps['options'];
};

export interface RecommendationsDefinition
  extends RecommendationOnlyControllerDefinitionWithoutProps<Recommendations> {}
/**
 * @internal
 * Defines a `Recommendations` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Recommendations` properties.
 * @returns The `Recommendations` controller definition.
 * */
export function defineRecommendations(
  props: RecommendationsProps
): RecommendationsDefinition & RecommendationsDefinitionMeta {
  return {
    recommendation: true,
    _recommendationProps: {
      ...props.options,
    },
    build: (engine) => buildRecommendations(engine, props),
  };
}
