import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box.js';
import {
  StandaloneSearchBox,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box.js';

export type {StandaloneSearchBoxOptions} from './headless-standalone-search-box-options.js';
export type {StandaloneSearchBoxState} from './headless-standalone-search-box.js';
export type {StandaloneSearchBox, StandaloneSearchBoxProps};

export interface StandaloneSearchBoxDefinition
  extends UniversalControllerDefinitionWithoutProps<StandaloneSearchBox> {}

/**
 * Defines the `StandaloneSearchBox` controller for the purpose of server-side rendering.
 *
 * @param props - The configurable `StandaloneSearchBox` properties.
 * @returns The `StandaloneSearchBox` controller definition.
 *
 * @internal
 */
export function defineStandaloneSearchBox(
  props: StandaloneSearchBoxProps
): StandaloneSearchBoxDefinition {
  return {
    listing: true,
    search: true,
    standalone: true,
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
