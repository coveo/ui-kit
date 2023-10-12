import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {HistoryManager, buildHistoryManager} from './headless-history-manager.js';

export * from './headless-history-manager.js';

/**
 * @internal
 */
export const defineHistoryManager = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  HistoryManager
> => ({
  build: (engine) => buildHistoryManager(engine),
});
