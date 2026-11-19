import {
  buildSearchBox,
  type SearchBox,
  type SearchBoxOptions,
  type SearchBoxProps,
  type SearchBoxState,
  type Suggestion,
} from '@coveo/headless/commerce';
import type {SearchBox as CoreSearchBox} from '@coveo/headless/ssr-internal';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  CoreSearchBox,
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
};

export type SearchBoxDefinition = SearchOnlyControllerDefinitionWithoutProps<SearchBox>;

/**
 * Defines a `SearchBox` controller instance.
 * @group Definers
 *
 * @returns The `SearchBox` controller definition.
 */
export function defineSearchBox(props: SearchBoxProps = {}): SearchBoxDefinition {
  return {
    search: true,
    build: (engine) => buildSearchBox(engine, props),
  };
}
