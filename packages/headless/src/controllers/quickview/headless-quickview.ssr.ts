import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Quickview, QuickviewProps, buildQuickview} from './headless-quickview';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
  CoreQuickviewState,
  CoreQuickview,
} from './headless-quickview';

/**
 * @internal
 */
export const defineQuickview = (
  props: QuickviewProps
): ControllerDefinitionWithoutProps<SearchEngine, Quickview> => ({
  build: (engine) => buildQuickview(engine, props),
});
