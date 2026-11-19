import type {SearchEngine} from '@coveo/headless';
import {buildTab, type Tab, type TabProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type Tab,
  type TabInitialState,
  type TabOptions,
  type TabProps,
  type TabState,
} from '@coveo/headless';

export interface TabDefinition extends ControllerDefinitionWithoutProps<SearchEngine, Tab> {}

/**
 * Defines a `Tab` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Tab` properties.
 * @returns The `Tab` controller definition.
 * */
export function defineTab(props: TabProps): TabDefinition {
  return {
    build: (engine) => buildTab(engine, props),
  };
}
