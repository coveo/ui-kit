import {RecommendationOnlyControllerDefinitionWithProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  RecommendationsOptions,
  RecommendationsState,
} from '../recommendations/headless-recommendations.js';
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
  options: {} & RecommendationsProps['options'];
};

export interface RecommendationsDefinition
  extends RecommendationOnlyControllerDefinitionWithProps<
    Recommendations,
    Partial<RecommendationsOptions> & {a?: string}
  > {}

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
    options: {
      ...props.options,
    },
    buildWithProps: (engine, options: RecommendationsOptions) => {
      return buildRecommendations(engine, {options});
    },
  };
}
