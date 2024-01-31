import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {Quickview, QuickviewProps, buildQuickview} from './headless-quickview';

export * from './headless-quickview';

/**
 * Defines a `Quickview` controller instance.
 *
 * @param props - The configurable `Quickview` properties.
 * @returns The `Quickview` controller definition.
 * */
export function defineQuickview(
  props: QuickviewProps
): ControllerDefinitionWithoutProps<SearchEngine, Quickview> {
  return {
    build: (engine) => buildQuickview(engine, props),
  };
}
