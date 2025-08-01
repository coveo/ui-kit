import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildSearchStatus,
  type SearchStatus,
} from '../../../../controllers/search-status/headless-search-status.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/search-status/headless-search-status.js';

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
