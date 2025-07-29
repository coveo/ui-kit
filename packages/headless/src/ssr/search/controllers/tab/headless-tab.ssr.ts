import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildTab,
  type Tab,
  type TabProps,
} from '../../../../controllers/tab/headless-tab.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export * from '../../../../controllers/tab/headless-tab.js';

export interface TabDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Tab> {}

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
