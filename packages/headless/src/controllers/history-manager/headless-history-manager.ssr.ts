import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {HistoryManager, buildHistoryManager} from './headless-history-manager';

export * from './headless-history-manager';

/**
 * Defines a `HistoryManager` controller instance.
 *
 * @returns The `HistoryManager` controller definition.
 * */
export function defineHistoryManager(): ControllerDefinitionWithoutProps<
  SearchEngine,
  HistoryManager
> {
  return {
    build: (engine) => buildHistoryManager(engine),
  };
}
