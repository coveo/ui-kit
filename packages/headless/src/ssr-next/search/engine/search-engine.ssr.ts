/**
 * Utility functions to be used for Server Side Rendering.
 */
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import type {SearchEngineDefinitionOptions} from '../types/engine.js';

/**
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 *
 * @param options - The search engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 *
 * @group Engine
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(options: SearchEngineDefinitionOptions<TControllerDefinitions>) {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const getOptions = () => {
    return engineOptions;
  };

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  return {
    fetchStaticState: fetchStaticStateFactory(
      controllerDefinitions,
      getOptions()
    ),
    hydrateStaticState: hydratedStaticStateFactory(
      controllerDefinitions,
      getOptions()
    ),
    setNavigatorContextProvider,
  };
}

// //////////////
// //////////////
// //////////////
// //////////////

// function getParamInitialState() {
//   return {
//     initialState: {
//       parameters: {
//         q: 'test',
//       },
//     },
//   };
// }

// function getContextInitialState() {
//   return {
//     initialState: {
//       values: {},
//     },
//   };
// }

// async function main() {
//   const engineDefinition = defineSearchEngine({
//     configuration: getSampleEngineConfiguration(),
//     controllers: {
//       searchBox: defineSearchBox(),
//       results: defineResultList(),
//       pager: definePager(),
//       param: defineSearchParameterManager(),
//       context: defineContext(),
//     },
//   });

//   const {fetchStaticState, hydrateStaticState} = engineDefinition;

//   const staticState = await fetchStaticState({
//     controllers: {
//       param: getParamInitialState(),
//       context: getContextInitialState(),
//     },
//   });

//   hydrateStaticState(staticState);
// }
