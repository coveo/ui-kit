import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SearchStatus, buildSearchStatus} from './headless-search-status';

export type {SearchStatus, SearchStatusState} from './headless-search-status';

/**
 * @internal
 */
export const defineSearchStatus = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  SearchStatus
> => ({
  build: (engine) => buildSearchStatus(engine),
});
