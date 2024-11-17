import {UnknownAction} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {Recommendations} from '../../controllers/commerce/recommendations/headless-recommendations.js';
import {RecommendationsDefinitionMeta} from '../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
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

    const unavailabeInRecs =
      // TODO: use this disjunction pattern for all other conditions
      (solutionType === SolutionType['recommendation'] &&
        !('recommendation' in definition)) ||
      ('recommendation' in definition &&
        definition['recommendation'] === false &&
        solutionType === SolutionType['recommendation']);

    if (
      unavailableInSearchSolutionType ||
      unavailableInListingSolutionType ||
      unavailableInStandaloneSolutionType ||
      unavailabeInRecs
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

export function filterRecommendationControllers<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllerDefinitions extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  controllers: Record<string, Controller>, // TODO: or  InferControllersMapFromDefinition<TControllerDefinitions, SolutionType>
  controllerDefinitions: TControllerDefinitions,
  logger: Logger
) {
  const slotIdSet = new Set<string>();

  const isRecommendationDefinition = <
    C extends ControllerDefinition<TEngine, Controller>,
  >(
    controllerDefinition: C
  ): controllerDefinition is C & RecommendationsDefinitionMeta => {
    return (
      'recommendation' in controllerDefinition &&
      controllerDefinition.recommendation === true
    );
  };

  const warnDuplicateRecommendation = (slotId: string, productId?: string) => {
    logger.warn(
      'Multiple recommendation controllers found for the same slotId and productId',
      {slotId, productId}
    );
  };

  const filtered = Object.entries(controllerDefinitions).filter(
    ([_, value]) => {
      if (!isRecommendationDefinition(value)) {
        return false;
      }
      const {slotId, productId} = value.options;
      const key = `${slotId}${productId || ''}`;
      if (slotIdSet.has(key)) {
        warnDuplicateRecommendation(slotId, productId);
        return false;
      }
      slotIdSet.add(key);
      return true;
    }
  );

  const name = filtered.map(([name, _]) => name);

  return {
    /**
     * Go through all the controllers passed in argument and only refresh recommendation controllers.
     *
     * @param controllers - A record of all controllers where the key is the controller name and the value is the controller instance.
     * @param controllerNames - A list of all recommendation controllers to refresh
     */
    refresh(whitelist?: string[]) {
      if (whitelist === undefined) {
        return;
      }
      const isRecommendationController = (key: string) =>
        name.includes(key) && whitelist.includes(key);

      Object.entries(controllers)
        .filter(([key, _]) => isRecommendationController(key))
        .forEach(([_, controller]) =>
          (controller as Recommendations).refresh?.()
        );
    },
  };
}
