import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildSearchStatus,
  type SearchStatus,
} from './headless-search-status.js';

export * from './headless-search-status.js';

export interface SearchStatusDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, SearchStatus> {}

/**
 * Defines a `SearchStatus` controller instance.
 * @group Definers
 *
 * @returns The `SearchStatus` controller definition.
 * */
export function defineSearchStatus(): SearchStatusDefinition {
  return {
    build: (engine) => buildSearchStatus(engine),
  };
}
