import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  Quickview,
  QuickviewProps,
  buildQuickview,
} from './headless-quickview.js';

export * from './headless-quickview.js';

export interface QuickviewDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Quickview> {}

/**
 * Defines a `Quickview` controller instance.
 *
 * @param props - The configurable `Quickview` properties.
 * @returns The `Quickview` controller definition.
 * */
export function defineQuickview(props: QuickviewProps): QuickviewDefinition {
  return {
    build: (engine) => buildQuickview(engine, props),
  };
}
