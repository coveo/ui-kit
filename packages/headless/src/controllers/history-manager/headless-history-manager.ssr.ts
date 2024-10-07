import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  HistoryManager,
  buildHistoryManager,
} from './headless-history-manager.js';

export * from './headless-history-manager.js';

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
