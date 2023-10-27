import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {SearchStatus, buildSearchStatus} from './headless-search-status';

export * from './headless-search-status';

/**
 * @alpha
 */
export const defineSearchStatus = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  SearchStatus
> => ({
  build: (engine) => buildSearchStatus(engine),
});
