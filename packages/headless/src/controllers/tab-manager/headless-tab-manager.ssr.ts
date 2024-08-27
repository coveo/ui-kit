import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {TabManager, buildTabManager} from './headless-tab-manager';

export * from './headless-tab-manager';

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
