import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {SearchStatus, buildSearchStatus} from './headless-search-status.js';

export * from './headless-search-status.js';

export interface SearchStatusDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, SearchStatus> {}

/**
 * Defines a `SearchStatus` controller instance.
 *
 * @returns The `SearchStatus` controller definition.
 * */
export function defineSearchStatus(): SearchStatusDefinition {
  return {
    build: (engine) => buildSearchStatus(engine),
  };
}
