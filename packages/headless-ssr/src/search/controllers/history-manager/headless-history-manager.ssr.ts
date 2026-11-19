import type {SearchEngine} from '@coveo/headless';
import {buildHistoryManager, type HistoryManager} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type HistoryManager, type HistoryManagerState} from '@coveo/headless';

export interface HistoryManagerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  HistoryManager
> {}

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
