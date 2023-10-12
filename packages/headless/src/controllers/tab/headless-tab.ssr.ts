import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Tab, TabProps, buildTab} from './headless-tab.js';

export * from './headless-tab.js';

/**
 * @internal
 */
export const defineTab = (
  props: TabProps
): ControllerDefinitionWithoutProps<SearchEngine, Tab> => ({
  build: (engine) => buildTab(engine, props),
});
