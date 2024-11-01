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
 * @group Definers
 *
 * @param props - The configurable `Recommendations` properties.
 * @returns The `Recommendations` controller definition.
 * */
export function defineRecommendations(
  props: RecommendationsProps
): RecommendationsDefinition & {
  isRecs: true;
} & RecommendationsProps['options'] {
  // TODO: have an extended recommendationDefinition that is not exposed
  return {
    search: true,
    listing: true,
    standalone: true,
    // TODO: encapsulate into a single object called meta (e.g. meta: {isRecs: true, ...props.options})
    isRecs: true, // TODO: mark internal
    ...props.options, // TODO: mark internal
    build: (engine) => buildRecommendations(engine, props),
  };
}
