import {UnknownAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers/controller/headless-controller.js';
import {InvalidControllerDefinition} from '../../utils/errors.js';
import {clone, filterObject, mapObject} from '../../utils/utils.js';
import {
  ControllersMap,
  InferControllerStaticStateMapFromControllers,
} from '../ssr-engine/types/common.js';
import {SSRCommerceEngine} from './factories/build-factory.js';
import {
  ControllerDefinition,
  ControllerDefinitionOption,
  ControllerDefinitionsMap,
  ControllerWithKind,
  EngineStaticState,
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllersMapFromDefinition,
  SolutionType,
} from './types/common.js';

function hasKindProperty(
  controller: Controller | ControllerWithKind
): controller is ControllerWithKind {
  return '_kind' in controller;
}

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
      ...(hasKindProperty(controller) && {_kind: controller._kind}),
    })) as InferControllerStaticStateMapFromControllers<ControllersMap>,
    searchActions: searchActions.map((action) => clone(action)),
  };
}

function buildControllerFromDefinition<
  TControllerDefinition extends ControllerDefinition<Controller>,
>({
  definition,
  engine,
  solutionType,
  props,
}: {
  definition: TControllerDefinition;
  engine: SSRCommerceEngine;
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
  TControllerDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>({
  definitionsMap,
  engine,
  solutionType,
  propsMap,
}: {
  definitionsMap: TControllerDefinitionsMap;
  engine: SSRCommerceEngine;
  solutionType: TSolutionType;
  propsMap: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
}): InferControllersMapFromDefinition<
  TControllerDefinitionsMap,
  TSolutionType
> {
  const controllerMap = mapObject(definitionsMap, (definition, key) => {
    const unavailableInSolutionType = () =>
      !(solutionType in definition) ||
      (solutionType in definition &&
        definition[solutionType as keyof typeof definition] === false);

    const props = propsMap?.[key as keyof typeof propsMap];

    if (unavailableInSolutionType()) {
      return null;
    }

    return buildControllerFromDefinition({
      definition,
      engine,
      solutionType,
      props,
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
