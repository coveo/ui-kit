import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {
  SearchBox,
  buildSearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  Suggestion,
} from './headless-search-box';

export type {
  SearchBoxState,
  SearchBox,
  SearchBoxProps,
} from './headless-search-box';
export type {SearchBoxOptions, Suggestion};

export interface SearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<SearchBox> {}

/**
 * Defines the `SearchBox` controller for the purpose of server-side rendering.
 *
 * @returns The `SearchBox` controller definition.
 *
 * @internal
 */
export function defineSearchBox(
  props: SearchBoxProps = {}
): SearchBoxDefinition {
  return {
    search: true,
    build: (engine) => buildSearchBox(engine, props),
  };
}
