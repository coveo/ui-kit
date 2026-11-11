import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, filterObject, mapObject} from '../../utils/utils.js';
import type {InferControllerStaticStateMapFromControllers} from '../common/types/controller-inference.js';
import type {SSRCommerceEngine} from './factories/build-factory.js';
import type {CommonBuildConfig} from './types/build.js';
import type {SolutionType} from './types/controller-constants.js';
import type {
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './types/controller-definitions.js';
import type {
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
} from './types/controller-inference.js';

export function createStaticState<
  TSearchAction extends UnknownAction,
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>({
  searchActions,
  controllers,
}: {
  searchActions: TSearchAction[];
  controllers: Record<string, Controller>;
}) {
  return {
    controllers: mapObject(controllers, (controller) => ({
      state: clone(controller.state),
    })) as InferControllerStaticStateMapFromDefinitionsWithSolutionType<
      TControllerDefinitions,
      TSolutionType
    > &
      InferControllerStaticStateMapFromControllers<FilteredBakedInControllers<TSolutionType>>,
    searchActions: searchActions.map((action) => clone(action)),
  };
}

/**
 * Builds the controllers of the definition that are available for the kind of page, each with the
 * page facts of the request.
 */
export function buildControllerDefinitions<
  TControllerDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>({
  definitionsMap,
  engine,
  solutionType,
  buildConfig,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: SSRCommerceEngine;
  solutionType: TSolutionType;
  buildConfig: CommonBuildConfig;
}): InferControllersMapFromDefinition<TControllerDefinitionsMap, TSolutionType> {
  const controllerMap = mapObject(definitionsMap, (definition) => {
    const unavailableInSolutionType =
      !(solutionType in definition) ||
      definition[solutionType as keyof typeof definition] === false;

    if (unavailableInSolutionType) {
      return null;
    }

    return definition.build(engine, {solutionType, buildConfig});
  });

  return filterObject(
    controllerMap,
    (value) => value !== null
  ) as InferControllersMapFromDefinition<TControllerDefinitionsMap, TSolutionType>;
}
