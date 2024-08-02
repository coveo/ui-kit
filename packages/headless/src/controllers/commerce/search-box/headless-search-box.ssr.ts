import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {SearchBox, SearchBoxProps, buildSearchBox} from './headless-search-box';

export * from './headless-search-box';

export interface SearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<SearchBox> {}

/**
 * @internal
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
