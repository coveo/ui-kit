import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {RecommendationsState} from '../recommendations/headless-recommendations.js';
import {
  RecommendationsProps,
  Recommendations,
  buildRecommendations,
} from './headless-recommendations.js';

export type {Recommendations, RecommendationsState};

export interface RecommendationsDefinition
  extends UniversalControllerDefinitionWithoutProps<Recommendations> {}
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
    standalone: true,
    build: (engine) => buildRecommendations(engine, props),
  };
}
