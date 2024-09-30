import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  StandaloneSearchBox,
  StandaloneSearchBoxProps,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box.js';

export * from './headless-standalone-search-box.js';

export interface StandaloneSearchBoxDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, StandaloneSearchBox> {}

/**
 * Defines a `StandaloneSearchBox` controller instance.
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
