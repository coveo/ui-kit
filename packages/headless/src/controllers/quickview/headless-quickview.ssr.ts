import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {Quickview, QuickviewProps, buildQuickview} from './headless-quickview.js';

export * from './headless-quickview.js';

/**
 * @internal
 */
export const defineQuickview = (
  props: QuickviewProps
): ControllerDefinitionWithoutProps<SearchEngine, Quickview> => ({
  build: (engine) => buildQuickview(engine, props),
});
