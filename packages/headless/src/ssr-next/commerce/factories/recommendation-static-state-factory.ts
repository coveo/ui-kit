import type {UnknownAction} from '@reduxjs/toolkit';
import {filterObject} from '../../../utils/utils.js';
import {createStaticState} from '../controller-utils.js';
import type {BuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  AugmentedControllerDefinition,
  FilteredBakedInControllers,
  RecommendationControllerSettings,
} from '../types/controller-definitions.js';
import type {InferControllerStaticStateMapFromDefinitionsWithSolutionType} from '../types/controller-inference.js';
import type {
  BuildResult,
  CommerceControllerDefinitionsMap,
  EngineStaticState,
  FetchStaticStateFunction,
  FetchStaticStateParameters,
} from '../types/engine.js';
import {filterRecommendationControllers} from '../utils/recommendation-filter.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
} from './build-factory.js';

export function fetchRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): FetchStaticStateFunction<TControllerDefinitions> {
  // TODO: KIT-4619: no longer the right way to get the allowed recommendation keys
  const getAllowedRecommendationKeys = (
    props: FetchStaticStateParameters<TControllerDefinitions>[0]
  ): string[] => {
    if (props && 'controllers' in props) {
      const enabledRecommendationControllers = filterObject(
        props.controllers as Record<string, RecommendationControllerSettings>,
        (value) => Boolean(value.enabled)
      );
      return Object.keys(enabledRecommendationControllers);
    }
    return [];
  };

  return async (
    ...params: FetchStaticStateParameters<TControllerDefinitions>
  ) => {
    const [props] = params;
    const allowedRecommendationKeys = getAllowedRecommendationKeys(props);

    const solutionTypeBuild = await buildFactory(
      controllerDefinitions,
      options
    )(SolutionType.recommendation);

    const {engine, controllers} = (await solutionTypeBuild(
      ...params
    )) as BuildResult<TControllerDefinitions>;

    filterRecommendationControllers(
      controllers,
      controllerDefinitions ?? {}
    ).refresh(allowedRecommendationKeys);

    const searchActions = await Promise.all(
      engine.waitForRequestCompletedAction()
    );

    return createStaticState({
      searchActions,
      controllers,
    }) as EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllerDefinitions,
        SolutionType
      > &
        FilteredBakedInControllers<SolutionType.recommendation>
    > &
      BuildConfig<SolutionType.recommendation>;
  };
}
