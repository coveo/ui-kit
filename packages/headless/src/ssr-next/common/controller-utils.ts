import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, mapObject} from '../../utils/utils.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
} from './types/controllers.js';
import type {EngineStaticState} from './types/engine.js';
import type {
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
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
      : (() => {
          const controller = definition.buildWithProps(engine, props);
          return {...controller, initialState: controller.state};
        })()
  ) as InferControllerFromDefinition<TControllerDefinition>; // TODO: ensure the type follow and that initial state is mandatory
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

export function createStaticState<
  TSearchAction extends UnknownAction,
  TControllerDefinitions extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
>({
  searchAction,
  controllers,
}: {
  searchAction: TSearchAction;
  controllers: InferControllersMapFromDefinition<TControllerDefinitions>;
}): EngineStaticState<
  TSearchAction,
  InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
> {
  return {
    controllers: mapObject(controllers, (controller) => {
      const base = {state: clone(controller.state)};
      // TODO: check if initialState is an object
      if ('initialState' in controller) {
        // TODO: check if that works!!!
        return {...base, initialState: clone(controller.initialState)};
      }
      return base;
    }) as InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>,
    searchAction: clone(searchAction),
  };
}
