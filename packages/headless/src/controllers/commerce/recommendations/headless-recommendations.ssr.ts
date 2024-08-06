import {
  RecommendationOnlyControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common';
import {RecommendationsState} from '../../../features/commerce/recommendations/recommendations-state';
import {
  RecommendationsProps,
  Recommendations,
  buildRecommendations,
} from './headless-recommendations';

export type {Recommendations, RecommendationsState};

export interface RecommendationsDefinition
  extends RecommendationOnlyControllerDefinitionWithoutProps<Recommendations> {}
/**
 * @internal
 * Defines a `Recommendations` controller instance.
 *
 * @param props - The configurable `Recommendations` properties.
 * @returns The `Recommendations` controller definition.
 * */
export function defineRecommendations(
  props: RecommendationsProps
): RecommendationsDefinition {
  return {
    search: true,
    listing: true,
    recommendation: true,
    build: (engine) => buildRecommendations(engine, props),
  };
}
