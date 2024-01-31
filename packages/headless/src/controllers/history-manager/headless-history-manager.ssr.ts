import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {HistoryManager, buildHistoryManager} from './headless-history-manager';

export * from './headless-history-manager';

export interface HistoryManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, HistoryManager> {}

/**
 * Defines a `HistoryManager` controller instance.
 *
 * @returns The `HistoryManager` controller definition.
 * */
export function defineHistoryManager(): HistoryManagerDefinition {
  return {
    build: (engine) => buildHistoryManager(engine),
  };
}
