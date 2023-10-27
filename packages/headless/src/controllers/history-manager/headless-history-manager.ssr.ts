import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {HistoryManager, buildHistoryManager} from './headless-history-manager';

export * from './headless-history-manager';

/**
 * @alpha
 */
export const defineHistoryManager = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  HistoryManager
> => ({
  build: (engine) => buildHistoryManager(engine),
});
