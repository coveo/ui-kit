import {
  recommendationInternalOptionKey,
  RecommendationOnlyControllerDefinitionWithProps,
} from '../../../app/commerce-ssr-engine/types/common.js';
import {Kind} from '../../../app/commerce-ssr-engine/types/kind.js';
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
    buildWithProps: (
      engine,
      options: Omit<RecommendationsOptions, 'slotId'>
    ) => {
      const staticOptions = props.options;
      const controller = buildRecommendations(engine, {
        options: {...staticOptions, ...options},
      });
      const copy = Object.defineProperties(
        {},
        Object.getOwnPropertyDescriptors(controller)
      );

      Object.defineProperty(copy, '_kind', {
        value: Kind.Recommendations,
      });

      return copy as typeof controller & {_kind: Kind.Recommendations};
    },
  };
}
