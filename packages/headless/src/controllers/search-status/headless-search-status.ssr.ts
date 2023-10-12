import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {SearchStatus, buildSearchStatus} from './headless-search-status.js';

export * from './headless-search-status.js';

/**
 * @internal
 */
export const defineSearchStatus = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  SearchStatus
> => ({
  build: (engine) => buildSearchStatus(engine),
});
