import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box';
import {
  buildStandaloneSearchBox,
  StandaloneSearchBox,
} from './headless-standalone-search-box';

export interface StandaloneSearchBoxDefinition
  extends SharedControllerDefinitionWithoutProps<StandaloneSearchBox> {}

/**
 * @internal
 * Defines a `StandaloneSearchBox` controller instance.
 *
 * @param props - The configurable `SearchBox` properties.
 * @returns The `SearchBox` controller definition.
 * */
export function defineStandaloneSearchBox(
  props: StandaloneSearchBoxProps
): StandaloneSearchBoxDefinition {
  return {
    listing: true,
    search: true,
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
