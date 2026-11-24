import {
  buildSearchBox,
  type CoreSearchBox,
  type SearchBox,
  type SearchBoxOptions as CoreSearchBoxOptions,
  type SearchBoxState,
  type Suggestion,
} from '../../../../controllers/commerce/search-box/headless-search-box.js';
import type {SearchOnlyControllerDefinition} from '../../types/controller-definitions.js';

export type {CoreSearchBox, SearchBox, SearchBoxState, Suggestion};

/**
 * The `SearchBox` controller options. Whether the search fills `results` rather than `products` comes
 * from the `enableResults` option of the engine definition.
 */
export type SearchBoxOptions = Omit<CoreSearchBoxOptions, 'enableResults'>;

export interface SearchBoxProps {
  /**
   * The `SearchBox` controller options.
   */
  options?: SearchBoxOptions;
}

export type SearchBoxDefinition = SearchOnlyControllerDefinition<SearchBox>;

/**
 * Defines a `SearchBox` controller instance.
 * @group Definers
 *
 * @param props - The static `SearchBox` properties.
 * @returns The `SearchBox` controller definition.
 */
export function defineSearchBox(props: SearchBoxProps = {}): SearchBoxDefinition {
  return {
    search: true,
    build: (engine, {enableResults}) =>
      buildSearchBox(engine, {
        ...props,
        options: {...props.options, enableResults: enableResults.search},
      }),
  };
}
