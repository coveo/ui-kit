import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {buildTab, type Tab, type TabProps} from '../../../../controllers/tab/headless-tab.js';
import type {ControllerDefinition} from '../../types/controller-definition.js';

export * from '../../../../controllers/tab/headless-tab.js';

export interface TabDefinition extends ControllerDefinition<SearchEngine, Tab> {}

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
