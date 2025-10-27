import type {UnknownAction} from '@reduxjs/toolkit';
import {
  buildSearchEngine,
  type SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {buildControllerDefinitions} from '../controller-utils.js';
import type {
  BuildConfig,
  SearchCompletedAction,
  SSRSearchEngine,
} from '../types/build.js';
import type {
  AugmentedControllerDefinition,
  BakedInSearchControllers,
  ControllerDefinitionsMap,
} from '../types/controller-definition.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllersMapFromDefinition,
} from '../types/controller-inference.js';
import type {SearchEngineDefinitionOptions} from '../types/engine.js';
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
  <
    TControllerDefinitions extends ControllerDefinitionsMap<
      SSRSearchEngine,
      Controller
    >,
  >(
    controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
    options: SearchEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  async (
    buildOptions: BuildConfig & {
      controllers?: InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
      searchActions?: UnknownAction[];
    }
  ) => {
    const controllerProps = wireControllerParams(
      controllerDefinitions,
      buildOptions
    );

    const engineOptions = augmentSearchEngineOptions(options, buildOptions);

    const engine = buildSSRSearchEngine(engineOptions);

    const controllers = buildControllerDefinitions({
      definitionsMap: controllerDefinitions,
      engine,
      propsMap:
        controllerProps as unknown as InferControllerPropsMapFromDefinitions<
          AugmentedControllerDefinition<TControllerDefinitions>
        >,
    });

    if (buildOptions.searchActions) {
      buildOptions.searchActions.forEach((action) => {
        engine.dispatch(action);
      });
    }

    return {
      engine,
      controllers: controllers as InferControllersMapFromDefinition<
        AugmentedControllerDefinition<TControllerDefinitions>
      > &
        BakedInSearchControllers,
    };
  };
