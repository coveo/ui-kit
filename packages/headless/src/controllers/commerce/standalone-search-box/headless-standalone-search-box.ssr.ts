import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box';
import {
  StandaloneSearchBox,
  buildStandaloneSearchBox,
} from './headless-standalone-search-box';

export type {StandaloneSearchBoxState} from '../../standalone-search-box/headless-standalone-search-box';
export type {StandaloneSearchBoxProps, StandaloneSearchBox};

export interface StandaloneSearchBoxDefinition
  extends ControllerDefinitionWithoutProps<
    CommerceEngine,
    StandaloneSearchBox
  > {}

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
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
