import {
  buildSearchBox,
  type CoreSearchBox,
  type SearchBox,
  type SearchBoxOptions,
  type SearchBoxProps,
  type SearchBoxState,
  type Suggestion,
} from '../../../../controllers/commerce/search-box/headless-search-box.js';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  CoreSearchBox,
  SearchBox,
  SearchBoxProps,
  SearchBoxState,
  SearchBoxOptions,
  Suggestion,
};

export type SearchBoxDefinition =
  SearchOnlyControllerDefinitionWithoutProps<SearchBox>;

/**
 * Defines a `SearchBox` controller instance.
 * @group Definers
 *
 * @returns The `SearchBox` controller definition.
 */
export function defineSearchBox(
  props: SearchBoxProps = {}
): SearchBoxDefinition {
  return {
    search: true,
    build: (engine) => buildSearchBox(engine, props),
  };
}
