import type {SearchEngine} from '@coveo/headless';
import {buildTabManager, type TabManager} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type TabManager, type TabManagerState} from '@coveo/headless';

export interface TabManagerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  TabManager
> {}

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
