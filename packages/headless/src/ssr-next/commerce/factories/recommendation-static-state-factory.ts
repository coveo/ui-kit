import type {UnknownAction} from '@reduxjs/toolkit';
import {createStaticState} from '../controller-utils.js';
import type {BuildConfig, RecommendationBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  AugmentedControllerDefinition,
  FilteredBakedInControllers,
} from '../types/controller-definitions.js';
import type {InferControllerStaticStateMapFromDefinitionsWithSolutionType} from '../types/controller-inference.js';
import type {
  BuildResult,
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  EngineStaticState,
  FetchStaticStateFunction,
  FetchStaticStateParameters,
} from '../types/engine.js';
import {filterRecommendationControllers} from '../utils/recommendation-filter.js';
import {buildFactory} from './build-factory.js';

export function fetchRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): FetchStaticStateFunction<TControllerDefinitions> {
  return async (
    ...params: FetchStaticStateParameters<TControllerDefinitions>
  ) => {
    const [props] = params;
    const allowedRecommendationKeys = (
      props as RecommendationBuildConfig<TControllerDefinitions>
    ).recommendations as string[];

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

    const staticState = createStaticState({
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
      BuildConfig<TControllerDefinitions, SolutionType.recommendation>;

    return {
      ...params[0], // TODO: KIT-4754: remove index access after no longer relying on OptionTuple type
      ...staticState,
    };
  };
}
