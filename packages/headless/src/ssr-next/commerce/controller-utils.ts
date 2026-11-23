import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, filterObject, mapObject} from '../../utils/utils.js';
import type {SSRCommerceEngine} from './factories/build-factory.js';
import type {ControllerBuildContext} from './types/build.js';
import type {SolutionType} from './types/controller-constants.js';
import type {ControllerDefinitionsMap} from './types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from './types/controller-inference.js';
import type {CommerceStaticState} from './types/fetch-static-state.js';

export function createStaticState<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>({
  searchActions,
  controllers,
}: {
  searchActions: UnknownAction[];
  controllers: Record<string, Controller>;
}) {
  return {
    controllers: mapObject(controllers, (controller) => ({
      state: clone(controller.state),
    })) as CommerceStaticState<TControllerDefinitions, TSolutionType>['controllers'],
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
  buildConfig: ControllerBuildContext['buildConfig'];
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
