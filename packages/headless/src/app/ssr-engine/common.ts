import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers/controller/headless-controller';
import {clone, mapObject} from '../../utils/utils';
import {CoreEngine} from '../engine';
import {
  ControllerDefinition,
  ControllerDefinitionsMap,
  ControllersMap,
  EngineStaticState,
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromControllers,
  InferControllersMapFromDefinition,
} from './types/common';

function buildControllerFromDefinition<
  TControllerDefinition extends ControllerDefinition<TEngine, Controller>,
  TEngine extends CoreEngine,
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
    CoreEngine,
    Controller
  >,
  TEngine extends CoreEngine,
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
