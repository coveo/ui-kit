import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildHistoryManager,
  type HistoryManager,
} from './headless-history-manager.js';

export * from './headless-history-manager.js';

export interface HistoryManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, HistoryManager> {}

/**
 * Defines a `HistoryManager` controller instance.
 * @group Definers
 *
 * @returns The `HistoryManager` controller definition.
 * */
export function defineHistoryManager(): HistoryManagerDefinition {
  return {
    build: (engine) => buildHistoryManager(engine),
  };
}
