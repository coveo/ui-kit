import type {UnknownAction} from '@reduxjs/toolkit/react';
import {buildLogger} from '../../../app/logger.js';
import {
  buildSearchEngine,
  type SearchEngine,
  type SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {buildControllerDefinitions} from '../../common/controller-utils.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {InferControllerPropsMapFromDefinitions} from '../../common/types/inference.js';
import type {
  BuildParameters,
  SearchCompletedAction,
  SearchEngineDefinitionOptions,
  SSRSearchEngine,
} from '../types/engine.js';

function isSearchCompletedAction(
  action: unknown
): action is SearchCompletedAction {
  return /^search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function buildSSRSearchEngine(options: SearchEngineOptions): SSRSearchEngine {
  const {middleware, promise} = createWaitForActionMiddleware(
    isSearchCompletedAction
  );
  const searchEngine = buildSearchEngine({
    ...options,
    middlewares: [...(options.middlewares ?? []), middleware],
  });
  return {
    ...searchEngine,
    get state() {
      return searchEngine.state;
    },
    waitForSearchCompletedAction() {
      return promise;
    },
  };
}

export const buildFactory =
  <
    TControllerDefinitions extends ControllerDefinitionsMap<
      SearchEngine,
      Controller
    >,
  >(
    controllerDefinitions: TControllerDefinitions | undefined,
    options: SearchEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  async (...[buildOptions]: BuildParameters<TControllerDefinitions>) => {
    const logger = buildLogger(options.loggerOptions);
    if (!options.navigatorContextProvider) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }
    const engine = buildSSRSearchEngine(
      buildOptions?.extend ? await buildOptions.extend(options) : options
    );
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap: (buildOptions && 'controllers' in buildOptions
        ? buildOptions.controllers
        : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });
    return {
      engine,
      controllers,
    };
  };
