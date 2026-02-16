import type {UnknownAction} from '@reduxjs/toolkit';
import {
  buildSearchEngine,
  type SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import {loadConfigurationActions} from '../../../features/configuration/configuration-actions-loader.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {buildControllerDefinitions} from '../controller-utils.js';
import type {SearchCompletedAction, SSRSearchEngine} from '../types/build.js';
import type {BakedInSearchControllers} from '../types/controller-definition.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {
  FetchStaticStateParameters,
  HydrateStaticStateParameters,
  SearchControllerDefinitionsMap,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import {wireControllerParams} from '../utils/controller-wiring.js';
import {augmentSearchEngineOptions} from '../utils/engine-wiring.js';

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
  <TControllerDefinitions extends SearchControllerDefinitionsMap>(
    controllerDefinitions: TControllerDefinitions,
    options: SearchEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  async (
    buildOptions:
      | FetchStaticStateParameters<TControllerDefinitions>
      | HydrateStaticStateParameters<TControllerDefinitions>
  ) => {
    const controllerProps = wireControllerParams(
      controllerDefinitions,
      buildOptions
    );

    const engineOptions = augmentSearchEngineOptions(options, buildOptions);

    const engine = buildSSRSearchEngine(engineOptions);

    const updateEngineConfiguration = (accessToken: string) => {
      const {updateBasicConfiguration} = loadConfigurationActions(engine);
      engine.dispatch(
        updateBasicConfiguration({
          accessToken,
        })
      );
    };

    if (options.onAccessTokenUpdate) {
      options.onAccessTokenUpdate(updateEngineConfiguration);
    }

    const controllers = buildControllerDefinitions({
      definitionsMap: controllerDefinitions,
      engine,
      propsMap: controllerProps,
    });

    if (buildOptions && 'searchActions' in buildOptions) {
      buildOptions.searchActions.forEach((action) => {
        engine.dispatch(action);
      });
    }

    return {
      engine,
      controllers:
        controllers as InferControllersMapFromDefinition<TControllerDefinitions> &
          BakedInSearchControllers,
    };
  };
