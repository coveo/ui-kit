import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, mapObject} from '../../utils/utils.js';
import {ControllerBuilder} from '../common/builders/controller-builder.js';
import {createStaticControllerBuilder} from '../common/builders/static-controller-builder.js';
import type {ControllerDefinitionsMap} from './types/controller-definition.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './types/controller-inference.js';
import type {SearchControllerDefinitionsMap} from './types/engine.js';
import type {SearchStaticState} from './types/fetch-static-state.js';

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
  propsMap?: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
}): InferControllersMapFromDefinition<TControllerDefinitionsMap> {
  return mapObject(definitionsMap, (definition, key) => {
    const props = propsMap?.[key as keyof typeof propsMap];
    return new ControllerBuilder(definition, engine, props).build();
  }) as InferControllersMapFromDefinition<TControllerDefinitionsMap>;
}

export function createStaticState<
  TSearchAction extends UnknownAction,
  TControllerDefinitions extends SearchControllerDefinitionsMap,
>({
  searchActions,
  controllers,
}: {
  searchActions: TSearchAction[];
  controllers: Record<string, Controller>;
}) {
  return {
    controllers: mapObject(controllers, (controller) =>
      createStaticControllerBuilder(controller).build()
    ) as SearchStaticState<TControllerDefinitions>['controllers'],
    searchActions: clone(searchActions),
  };
}
