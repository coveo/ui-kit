import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Tab, TabProps, buildTab} from './headless-tab.js';

export * from './headless-tab.js';

export interface TabDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Tab> {}

/**
 * Defines a `Tab` controller instance.
 *
 * @param props - The configurable `Tab` properties.
 * @returns The `Tab` controller definition.
 * */
export function defineTab(props: TabProps): TabDefinition {
  return {
    build: (engine) => buildTab(engine, props),
  };
}
