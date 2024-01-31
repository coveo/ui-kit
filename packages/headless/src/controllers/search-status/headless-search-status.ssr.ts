import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SearchStatus, buildSearchStatus} from './headless-search-status';

export * from './headless-search-status';

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
