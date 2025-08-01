import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  executeSearch,
  fetchQuerySuggestions,
} from '../../../features/insight-search/insight-search-actions.js';
import {searchboxSubmit} from '../../../features/query/query-analytics-actions.js';
import {logSearchboxSubmit} from '../../../features/query/query-insight-analytics-actions.js';
import type {Controller} from '../../controller/headless-controller.js';
import {
  buildCoreSearchBox,
  type Delimiters,
  type SearchBoxState,
  type Suggestion,
  type SuggestionHighlightingOptions,
} from '../../core/search-box/headless-core-search-box.js';
import type {SearchBoxOptions} from '../../core/search-box/headless-core-search-box-options.js';

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
 * The `SearchBox` controller allows users to enter a query and submit it to the Insight engine.
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
 * Creates an insight `SearchBox` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 *
 * @group Controllers
 * @category SearchBox
 */
export function buildSearchBox(
  engine: InsightEngine,
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
