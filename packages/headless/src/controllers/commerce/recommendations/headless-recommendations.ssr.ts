import {
  type RecommendationOnlyControllerDefinitionWithProps,
  recommendationInternalOptionKey,
} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  createControllerWithKind,
  Kind,
} from '../../../app/commerce-ssr-engine/types/kind.js';
import type {
  RecommendationsOptions,
  RecommendationsState,
} from '../recommendations/headless-recommendations.js';
import {
  buildRecommendations,
  type Recommendations,
  type RecommendationsProps,
} from './headless-recommendations.js';

export type {Recommendations, RecommendationsState};

export type RecommendationsDefinitionMeta = {
  [recommendationInternalOptionKey]: {} & RecommendationsProps['options'];
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
  props: RecommendationsProps
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
