import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SearchStatus, buildSearchStatus} from './headless-search-status';

export * from './headless-search-status';

/**
 * Defines a `SearchStatus` controller instance.
 *
 * @returns The `SearchStatus` controller definition.
 * */
export function defineSearchStatus(): ControllerDefinitionWithoutProps<
  SearchEngine,
  SearchStatus
> {
  return {
    build: (engine) => buildSearchStatus(engine),
  };
}
