import type {SearchEngine} from '@coveo/headless';
import {
  buildStandaloneSearchBox,
  type StandaloneSearchBox,
  type StandaloneSearchBoxProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type StandaloneSearchBoxAnalytics,
  type StandaloneSearchBoxOptions,
  type StandaloneSearchBoxProps,
  type StandaloneSearchBox,
  type StandaloneSearchBoxState,
} from '@coveo/headless';

export interface StandaloneSearchBoxDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  StandaloneSearchBox
> {}

/**
 * Defines a `StandaloneSearchBox` controller instance.
 * @group Definers
 *
 * @param props - The configurable `StandaloneSearchBox` properties.
 * @returns The `StandaloneSearchBox` controller definition.
 * */
export function defineStandaloneSearchBox(
  props: StandaloneSearchBoxProps
): StandaloneSearchBoxDefinition {
  return {
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
