import {Controller} from '../../../controllers';
import {
  SearchEngine,
  SearchEngineOptions,
} from '../../search-engine/search-engine';
import {ControllerDefinitionsMap} from './common-ssr-types';
import {
  EngineDefinition,
  EngineDefinitionOptions,
} from './core-engine-ssr-types';

export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;
