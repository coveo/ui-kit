import {
  recommendationInternalOptionKey,
  RecommendationOnlyControllerDefinitionWithProps,
} from '../../../app/commerce-ssr-engine/types/common.js';
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
  [recommendationInternalOptionKey]: {} & RecommendationsProps['options'];
};

export interface RecommendationsDefinition
  extends RecommendationOnlyControllerDefinitionWithProps<
    Recommendations,
    Partial<RecommendationsOptions>
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
    [recommendationInternalOptionKey]: {
      ...props.options,
    },
    //@ts-expect-error fixed in KIT-3801
    buildWithProps: (
      engine,
      options: Omit<RecommendationsOptions, 'slotId'>
    ) => {
      const staticOptions = props.options;
      return buildRecommendations(engine, {
        options: {...staticOptions, ...options},
      });
    },
  };
}
