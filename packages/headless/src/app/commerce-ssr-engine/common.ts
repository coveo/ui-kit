import {Controller} from '../../controllers/controller/headless-controller.js';
import {InvalidControllerDefinition} from '../../utils/errors.js';
import {filterObject, mapObject} from '../../utils/utils.js';
import {SSRCommerceEngine} from '../commerce-engine/commerce-engine.ssr.js';
import {InferControllerPropsMapFromDefinitions} from '../ssr-engine/types/common.js';
import {
  ControllerDefinition,
  ControllerDefinitionOption,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllerPropsFromDefinition,
  InferControllersMapFromDefinition,
  SolutionType,
} from './types/common.js';

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
    const unavailableInSearchSolutionType =
      'search' in definition &&
      definition['search'] === false &&
      solutionType === SolutionType['search'];

    const unavailableInListingSolutionType =
      'listing' in definition &&
      definition['listing'] === false &&
      solutionType === SolutionType['listing'];

    const unavailableInStandaloneSolutionType =
      solutionType === SolutionType['standalone'] && 'standalone' in definition
        ? definition['standalone'] === false
        : false;

    if (
      unavailableInSearchSolutionType ||
      unavailableInListingSolutionType ||
      unavailableInStandaloneSolutionType
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
