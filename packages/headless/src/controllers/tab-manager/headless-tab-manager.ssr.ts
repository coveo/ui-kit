import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {TabManager, buildTabManager} from './headless-tab-manager.js';

export * from './headless-tab-manager.js';

export interface TabManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, TabManager> {}

/**
 * Defines a `TabManager` controller instance.
 *
 * @returns The `TabManager` controller definition.
 * */
export function defineTabManager(): TabManagerDefinition {
  return {
    build: (engine) => buildTabManager(engine),
  };
}
