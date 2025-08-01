import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildHistoryManager,
  type HistoryManager,
} from '../../../../controllers/history-manager/headless-history-manager.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/history-manager/headless-history-manager.js';

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
