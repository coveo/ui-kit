import {UnknownAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers/controller/headless-controller.js';
import {InvalidControllerDefinition} from '../../utils/errors.js';
import {clone, filterObject, mapObject} from '../../utils/utils.js';
import {CoreEngine, CoreEngineNext} from '../engine.js';
import {
  ControllersMap,
  InferControllerStaticStateMapFromControllers,
} from '../ssr-engine/types/common.js';
import {
  ControllerDefinition,
  ControllerDefinitionOption,
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllersMapFromDefinition,
  SolutionType,
} from './types/common.js';

export function createStaticState<TSearchAction extends UnknownAction>({
  searchActions,
  controllers,
}: {
  searchActions: TSearchAction[];
  controllers: ControllersMap;
}): EngineStaticState<
  TSearchAction,
  InferControllerStaticStateMapFromControllers<ControllersMap>
> {
  return {
    controllers: mapObject(controllers, (controller) => ({
      state: clone(controller.state),
    })) as InferControllerStaticStateMapFromControllers<ControllersMap>,
    searchActions: searchActions.map((action) => clone(action)),
  };
}

function buildControllerFromDefinition<
  TControllerDefinition extends ControllerDefinition<TEngine, Controller>,
  TEngine extends CoreEngine | CoreEngineNext,
>({
  definition,
  engine,
  solutionType,
  props,
}: {
  definition: TControllerDefinition;
  engine: TEngine;
  solutionType: SolutionType;
  props?: InferControllerPropsFromDefinition<TControllerDefinition>;
}): InferControllerFromDefinition<TControllerDefinition> {
  return (
    'build' in definition
      ? definition.build(engine, solutionType)
      : definition.buildWithProps(engine, props, solutionType)
  ) as InferControllerFromDefinition<TControllerDefinition>;
}

export function buildControllerDefinitions<
  TControllerDefinitionsMap extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
  TEngine extends CoreEngine | CoreEngineNext,
  TSolutionType extends SolutionType,
>({
  definitionsMap,
  engine,
  solutionType,
  propsMap,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: TEngine;
  solutionType: TSolutionType;
  propsMap: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
}): InferControllersMapFromDefinition<
  TControllerDefinitionsMap,
  TSolutionType
> {
  const controllerMap = mapObject(definitionsMap, (definition, key) => {
    const unavailableInSolutionType = (type: SolutionType) =>
      (!(type in definition) && solutionType === SolutionType[type]) ||
      (type in definition &&
        definition[type as keyof typeof definition] === false &&
        solutionType === SolutionType[type]);

    if (
      unavailableInSolutionType(SolutionType.search) ||
      unavailableInSolutionType(SolutionType.listing) ||
      unavailableInSolutionType(SolutionType.standalone) ||
      unavailableInSolutionType(SolutionType.recommendation)
    ) {
      return null;
    }

    return buildControllerFromDefinition({
      definition,
      engine,
      solutionType,
      props: propsMap?.[key as keyof typeof propsMap],
    });
  });

  return filterObject(
    controllerMap,
    (value) => value !== null
  ) as InferControllersMapFromDefinition<
    TControllerDefinitionsMap,
    TSolutionType
  >;
}

export function ensureAtLeastOneSolutionType(
  options?: ControllerDefinitionOption
) {
  if (options?.listing === false && options?.search === false) {
    throw new InvalidControllerDefinition();
  }
}
