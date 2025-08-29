import type {UnknownAction} from '@reduxjs/toolkit';
import {createStaticState} from '../controller-utils.js';
import type {RecommendationBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
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
) {
  return async (
    ...params: FetchStaticStateParameters<
      TControllerDefinitions,
      SolutionType.recommendation
    >
  ) => {
    const [props] = params;
    const allowedRecommendationKeys = props?.recommendations;

    const solutionTypeBuild = await buildFactory(
      controllerDefinitions,
      options
    )(SolutionType.recommendation);

    const {engine, controllers} = await solutionTypeBuild(...params);

    filterRecommendationControllers(
      controllers,
      controllerDefinitions ?? {}
    ).refresh(allowedRecommendationKeys);

    const searchActions = await Promise.all(
      engine.waitForRequestCompletedAction()
    );

    const staticState = createStaticState<
      UnknownAction,
      TControllerDefinitions,
      SolutionType.recommendation
    >({
      searchActions,
      controllers,
    });

    return {
      ...(params[0] as RecommendationBuildConfig<TControllerDefinitions>), // TODO: KIT-4754: remove index access after no longer relying on OptionTuple type
      ...staticState,
    };
  };
}
