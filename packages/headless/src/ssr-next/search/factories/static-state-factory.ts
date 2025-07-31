import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {createStaticState} from '../../common/controller-utils.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {
  FetchStaticStateParameters,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';
import {buildFactory} from './build.js';

export function fetchStaticStateFactory<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(
  controllerDefinitions: TControllerDefinitions | undefined,
  options: SearchEngineDefinitionOptions<TControllerDefinitions>
) {
  return async (
    ...params: FetchStaticStateParameters<TControllerDefinitions>
  ) => {
    const searchEngineFactory = buildFactory(controllerDefinitions, options);
    const {engine, controllers} = await searchEngineFactory(...params);

    options.configuration.preprocessRequest =
      augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: options.configuration.preprocessRequest,
        navigatorContextProvider: options.navigatorContextProvider,
        loggerOptions: options.loggerOptions,
      });

    engine.executeFirstSearch();
    const staticState = createStaticState({
      searchAction: await engine.waitForSearchCompletedAction(),
      controllers: controllers,
    });

    return staticState;
  };
}
