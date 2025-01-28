import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  SearchBox,
  buildSearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  Suggestion,
} from './headless-search-box.js';

export type {
  SearchBoxState,
  SearchBox,
  SearchBoxProps,
  CoreSearchBox,
} from './headless-search-box.js';
export type {SearchBoxOptions, Suggestion};

export interface SearchBoxDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<SearchBox> {}

/**
 * Defines a `SearchBox` controller instance.
 * @group Definers
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
