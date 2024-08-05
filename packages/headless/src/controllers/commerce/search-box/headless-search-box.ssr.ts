import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {SearchBox, buildSearchBox} from './headless-search-box';

export type {SearchBoxState, SearchBox} from './headless-search-box';

export interface SearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<SearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
 *
 * @returns The `SearchBox` controller definition.
 *
 * @internal
 */
export function defineSearchBox(): SearchBoxDefinition {
  return {
    search: true,
    build: (engine) => buildSearchBox(engine),
  };
}
