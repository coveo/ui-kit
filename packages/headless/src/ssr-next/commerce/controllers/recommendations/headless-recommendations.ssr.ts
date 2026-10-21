import {
  buildRecommendations,
  type Recommendations,
  type RecommendationsOptions,
  type RecommendationsProps,
  type RecommendationsState,
} from '../../../../controllers/commerce/recommendations/headless-recommendations.js';
import {recommendationInternalOptionKey} from '../../types/controller-constants.js';
import type {UniversalControllerDefinitionWithProps} from '../../types/controller-definitions.js';

export type {Recommendations, RecommendationsState};

export type RecommendationsDefinitionMeta = {
  [recommendationInternalOptionKey]: {} & RecommendationsProps['options'];
};

export interface RecommendationsDefinition extends UniversalControllerDefinitionWithProps<
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
    search: true,
    listing: true,
    standalone: true,
    [recommendationInternalOptionKey]: {
      ...props.options,
    },
    buildWithProps: (engine, options: Omit<RecommendationsOptions, 'slotId'>) => {
      const staticOptions = props.options;
      return buildRecommendations(engine, {
        options: {...staticOptions, ...options},
      });
    },
  };
}
