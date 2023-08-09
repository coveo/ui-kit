import {Controller, SearchEngine} from '@coveo/headless';
import {
  ControllerDefinitionsMap,
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
} from '@coveo/headless/ssr';
import {InferControllerHooksMapFromDefinition} from './types';

export function defineSearchEngine<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
>(options: SearchEngineDefinitionOptions<TControllers>) {
  return {
    ...defineBaseSearchEngine({...options}),
    controllers: (options.controllers
      ? Object.fromEntries(
          Object.keys(options.controllers).map((key) => [
            `use${key.slice(0, 1).toUpperCase()}${key.slice(1)}`,
            () => {},
          ])
        )
      : {}) as InferControllerHooksMapFromDefinition<TControllers>,
  };
}
