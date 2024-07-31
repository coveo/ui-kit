import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers/controller/headless-controller';
import {InvalidControllerDefinition} from '../../utils/errors';
import {clone, mapObject} from '../../utils/utils';
import {CoreEngine, CoreEngineNext} from '../engine';
import {
  ControllerDefinition,
  ControllerDefinitionOption,
  ControllerDefinitionsMap,
  ControllersMap,
  EngineStaticState,
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromControllers,
  InferControllersMapFromDefinition,
  SolutionType,
} from './types/common';

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
>({
  definitionsMap,
  engine,
  solutionType,
  propsMap,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: TEngine;
  solutionType: SolutionType;
  propsMap: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
}): InferControllersMapFromDefinition<TControllerDefinitionsMap, SolutionType> {
  return mapObject(definitionsMap, (definition, key) =>
    buildControllerFromDefinition({
      definition,
      engine,
      solutionType,
      props: propsMap?.[key as keyof typeof propsMap],
    })
  ) as InferControllersMapFromDefinition<
    TControllerDefinitionsMap,
    SolutionType
  >;
}

export function createStaticState<
  TSearchAction extends AnyAction,
  TControllers extends ControllersMap,
>({
  searchAction,
  controllers,
}: {
  searchAction: TSearchAction;
  controllers: TControllers;
}): EngineStaticState<
  TSearchAction,
  InferControllerStaticStateMapFromControllers<TControllers>
> {
  return {
    controllers: mapObject(controllers, (controller) => ({
      state: clone(controller.state),
    })) as InferControllerStaticStateMapFromControllers<TControllers>,
    searchAction: clone(searchAction),
  };
}

export function composeFunction<
  TParameters extends Array<unknown>,
  TReturn,
  TChildren extends {},
>(
  parentFunction: (...params: TParameters) => TReturn,
  children: TChildren
): TChildren & {
  (...params: TParameters): TReturn;
} {
  const newFunction = function (...params: TParameters) {
    return parentFunction(...params);
  } as {
    (...params: TParameters): TReturn;
  } & TChildren;
  for (const [key, value] of Object.entries(children)) {
    (newFunction as unknown as Record<typeof key, typeof value>)[key] = value;
  }
  return newFunction;
}

export function ensureAtLeastOneSolutionType(
  options?: ControllerDefinitionOption
) {
  if (!options?.listing && !options?.search) {
    throw new InvalidControllerDefinition();
  }
}
