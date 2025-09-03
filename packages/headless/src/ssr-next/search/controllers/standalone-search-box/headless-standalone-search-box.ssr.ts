import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildStandaloneSearchBox,
  type StandaloneSearchBox,
  type StandaloneSearchBoxProps,
} from '../../../../controllers/standalone-search-box/headless-standalone-search-box.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/standalone-search-box/headless-standalone-search-box.js';

export interface StandaloneSearchBoxDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, StandaloneSearchBox> {}

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
