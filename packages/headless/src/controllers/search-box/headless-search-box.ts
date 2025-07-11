import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  logSearchboxSubmit,
  searchboxSubmit,
} from '../../features/query/query-analytics-actions.js';
import {fetchQuerySuggestions} from '../../features/query-suggest/query-suggest-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {
  Delimiters,
  SuggestionHighlightingOptions,
} from '../../utils/highlight.js';
import type {Controller} from '../controller/headless-controller.js';
import {
  buildCoreSearchBox,
  type SearchBoxState,
  type Suggestion,
} from '../core/search-box/headless-core-search-box.js';
import type {SearchBoxOptions} from '../core/search-box/headless-core-search-box-options.js';

export type {
  SearchBoxOptions,
  SearchBoxState,
  SuggestionHighlightingOptions,
  Suggestion,
  Delimiters,
};

export interface SearchBoxProps {
  /**
   * The `SearchBox` controller options.
   */
  options?: SearchBoxOptions;
}

/**
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI controller
 * with [highlighting for query suggestions](https://docs.coveo.com/en/headless/latest/usage/highlighting/).
 *
 * Example: [search-box.fn.tsx](https://github.com/coveo/ui-kit/blob/c090c1bd676792027815c52507e2aef8ccfaab91/packages/samples/headless-react/src/components/search-box/search-box.fn.tsx)
 *
 * @group Controllers
 * @category SearchBox
 */
export interface SearchBox extends Controller {
  /**
   * Updates the search box text value and shows the suggestions for that value.
   *
   * @param value - The string value to update the search box with.
   */
  updateText(value: string): void;

  /**
   * Clears the search box text and the suggestions.
   */
  clear(): void;

  /**
   * Shows the suggestions for the current search box value.
   */
  showSuggestions(): void;

  /**
   * Selects a suggestion and calls `submit`.
   *
   * @param value - The string value of the suggestion to select
   */
  selectSuggestion(value: string): void;

  /**
   * Deselects all facets and triggers a search query.
   */
  submit(): void;

  /**
   * The state of the `SearchBox` controller.
   */
  state: SearchBoxState;
}

/**
 * Creates a `SearchBox` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 *
 * @group Controllers
 * @category SearchBox
 */
export function buildSearchBox(
  engine: SearchEngine,
  props: SearchBoxProps = {}
): SearchBox {
  const searchBox = buildCoreSearchBox(engine, {
    ...props,
    executeSearchActionCreator: executeSearch,
    fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
    isNextAnalyticsReady: true,
  });

  return {
    ...searchBox,
    submit() {
      searchBox.submit(logSearchboxSubmit(), searchboxSubmit());
    },
    get state() {
      return searchBox.state;
    },
  };
}
