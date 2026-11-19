import type {SearchEngine} from '@coveo/headless';
import {buildQuickview, type Quickview, type QuickviewProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type CoreQuickview,
  type CoreQuickviewState,
  type QuickviewOptions,
  type QuickviewProps,
  type QuickviewState,
  type Quickview,
} from '@coveo/headless';

export interface QuickviewDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  Quickview
> {}

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
