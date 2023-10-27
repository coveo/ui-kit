import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Tab, TabProps, buildTab} from './headless-tab';

export * from './headless-tab';

/**
 * @alpha
 */
export const defineTab = (
  props: TabProps
): ControllerDefinitionWithoutProps<SearchEngine, Tab> => ({
  build: (engine) => buildTab(engine, props),
});
