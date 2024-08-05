import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box';
import {
  StandaloneSearchBox,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box';

export type {StandaloneSearchBoxState} from '../../standalone-search-box/headless-standalone-search-box';
export type {StandaloneSearchBoxProps, StandaloneSearchBox};

export interface StandaloneSearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<StandaloneSearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
 *
 * @returns The `SearchBox` controller definition.
 *
 * @internal
 */
export function defineStandaloneSearchBox(
  props: StandaloneSearchBoxProps
): StandaloneSearchBoxDefinition {
  return {
    search: true,
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
