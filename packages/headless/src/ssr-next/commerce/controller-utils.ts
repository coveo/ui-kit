import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {clone, filterObject, mapObject} from '../../utils/utils.js';
import {ControllerBuilder} from '../common/builders/controller-builder.js';
import {createStaticControllerBuilder} from '../common/builders/static-controller-builder.js';
import type {SSRCommerceEngine} from './factories/build-factory.js';
import type {SolutionType} from './types/controller-constants.js';
import type {
  ControllerDefinitionsMap,
  FilteredBakedInControllers,
} from './types/controller-definitions.js';
import type {
  InferControllerPropsMapFromDefinitions,
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
    controllers: mapObject(controllers, (controller) =>
      createStaticControllerBuilder(controller).build()
    ) as InferControllerStaticStateMapFromDefinitionsWithSolutionType<
      TControllerDefinitions,
      TSolutionType
    > &
      FilteredBakedInControllers<TSolutionType>,
    searchActions: searchActions.map((action) => clone(action)),
  };
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
  propsMap?: InferControllerPropsMapFromDefinitions<TControllerDefinitionsMap>;
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

    return new ControllerBuilder(definition, engine, props)
      .withAdditionalArgs([solutionType])
      .build();
  });

  return filterObject(
    controllerMap,
    (value) => value !== null
  ) as InferControllersMapFromDefinition<
    TControllerDefinitionsMap,
    TSolutionType
  >;
}
