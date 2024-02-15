import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Tab, TabProps, buildTab} from './headless-tab';

export * from './headless-tab';

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
