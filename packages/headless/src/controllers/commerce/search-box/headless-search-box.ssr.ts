import {
  SearchOnlyControllerDefinitionWithoutProps,
  SharedControllerDefinitionWithoutProps,
} from '../../../app/commerce-ssr-engine/types/common';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box';
import {
  buildStandaloneSearchBox,
  StandaloneSearchBox,
} from '../standalone-search-box/headless-standalone-search-box';
import {SearchBox, SearchBoxProps, buildSearchBox} from './headless-search-box';

export * from './headless-search-box';

export interface SearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<SearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
 *
 * @param props - The configurable `SearchBox` properties.
 * @returns The `SearchBox` controller definition.
 * */
export function defineSearchBox(props?: SearchBoxProps): SearchBoxDefinition {
  return {
    search: true,
    build: (engine) => buildSearchBox(engine, props),
  };
}

export interface StandaloneSearchBoxDefinition
  extends SharedControllerDefinitionWithoutProps<StandaloneSearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
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
