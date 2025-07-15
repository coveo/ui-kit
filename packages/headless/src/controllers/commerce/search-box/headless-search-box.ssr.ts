import type {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  buildSearchBox,
  type SearchBox,
  type SearchBoxOptions,
  type SearchBoxProps,
  type Suggestion,
} from './headless-search-box.js';

export type {
  CoreSearchBox,
  SearchBox,
  SearchBoxProps,
  SearchBoxState,
} from './headless-search-box.js';
export type {SearchBoxOptions, Suggestion};

export interface SearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<SearchBox> {}

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
