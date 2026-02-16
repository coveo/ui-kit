import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildQuickview,
  type Quickview,
  type QuickviewProps,
} from '../../../../controllers/quickview/headless-quickview.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/quickview/headless-quickview.js';

export interface QuickviewDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, Quickview> {}

/**
 * Defines a `Quickview` controller instance.
 * @group Definers
 *
 * @param props - The configurable `Quickview` properties.
 * @returns The `Quickview` controller definition.
 * */
export function defineQuickview(props: QuickviewProps): QuickviewDefinition {
  return {
    build: (engine) => buildQuickview(engine, props),
  };
}
