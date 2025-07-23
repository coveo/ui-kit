import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {buildTabManager, type TabManager} from './headless-tab-manager.js';

export * from './headless-tab-manager.js';

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
