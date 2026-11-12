import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildTabManager,
  type TabManager,
} from '../../../../controllers/tab-manager/headless-tab-manager.js';
import type {ControllerDefinition} from '../../types/controller-definition.js';

export * from '../../../../controllers/tab-manager/headless-tab-manager.js';

export interface TabManagerDefinition extends ControllerDefinition<SearchEngine, TabManager> {}

/**
 * Defines a `TabManager` controller instance.
 * @group Definers
 *
 * @returns The `TabManager` controller definition.
 * */
export function defineTabManager(): TabManagerDefinition {
  return {
    build: (engine) => buildTabManager(engine),
  };
}
