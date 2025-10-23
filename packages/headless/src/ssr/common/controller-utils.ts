import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, mapObject} from '../../utils/utils.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  ControllersMap,
} from './types/controllers.js';
import type {EngineStaticState} from './types/engine.js';
import type {
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromControllers,
  InferControllersMapFromDefinition,
} from './types/inference.js';

function buildControllerFromDefinition<
  TControllerDefinition extends ControllerDefinition<TEngine, Controller>,
  TEngine extends CoreEngine | CoreEngineNext,
>({
  definition,
  engine,
  props,
}: {
  definition: TControllerDefinition;
  engine: TEngine;
  props?: InferControllerPropsFromDefinition<TControllerDefinition>;
}): InferControllerFromDefinition<TControllerDefinition> {
  return (
    'build' in definition
      ? definition.build(engine)
      : definition.buildWithProps(engine, props)
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
  propsMap,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: TEngine;
  propsMap: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
}): InferControllersMapFromDefinition<TControllerDefinitionsMap> {
  return mapObject(definitionsMap, (definition, key) =>
    buildControllerFromDefinition({
      definition,
      engine,
      props: propsMap?.[key as keyof typeof propsMap],
    })
  ) as InferControllersMapFromDefinition<TControllerDefinitionsMap>;
}

export function createStaticState<TSearchAction extends UnknownAction>({
  searchAction,
  controllers,
}: {
  searchAction: TSearchAction;
  controllers: ControllersMap;
}): EngineStaticState<
  TSearchAction,
  InferControllerStaticStateMapFromControllers<ControllersMap>
> {
  return {
    controllers: mapObject(controllers, (controller) => ({
      state: clone(controller.state),
    })) as InferControllerStaticStateMapFromControllers<ControllersMap>,
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
): TChildren & ((...params: TParameters) => TReturn) {
  const newFunction = ((...params: TParameters) =>
    parentFunction(...params)) as ((...params: TParameters) => TReturn) &
    TChildren;
  for (const [key, value] of Object.entries(children)) {
    (newFunction as unknown as Record<typeof key, typeof value>)[key] = value;
  }
  return newFunction;
}
