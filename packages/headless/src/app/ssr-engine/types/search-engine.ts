import {Controller} from '../../../controllers';
import {
  SearchEngine,
  SearchEngineOptions,
} from '../../search-engine/search-engine';
import {ControllerDefinitionsMap} from './common';
import {EngineDefinition, EngineDefinitionOptions} from './core-engine';

export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

/**
 * @internal
 */
export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;
