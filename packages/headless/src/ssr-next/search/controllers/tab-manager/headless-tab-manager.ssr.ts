import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildTabManager,
  type TabManager,
} from '../../../../controllers/tab-manager/headless-tab-manager.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/tab-manager/headless-tab-manager.js';

interface TabManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, TabManager> {}

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
