import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Quickview, QuickviewProps, buildQuickview} from './headless-quickview';

export * from './headless-quickview';

/**
 * @alpha
 */
export const defineQuickview = (
  props: QuickviewProps
): ControllerDefinitionWithoutProps<SearchEngine, Quickview> => ({
  build: (engine) => buildQuickview(engine, props),
});
