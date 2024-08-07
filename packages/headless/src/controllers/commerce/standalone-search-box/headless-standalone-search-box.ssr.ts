import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box';
import {
  StandaloneSearchBox,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box';

export type {StandaloneSearchBoxOptions} from './headless-standalone-search-box-options';
export type {StandaloneSearchBoxState} from './headless-standalone-search-box';
export type {StandaloneSearchBox, StandaloneSearchBoxProps};

export interface StandaloneSearchBoxDefinition
  extends SharedControllerDefinitionWithoutProps<StandaloneSearchBox> {}

/**
 * Defines a `StandaloneSearchBox` controller instance.
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
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
