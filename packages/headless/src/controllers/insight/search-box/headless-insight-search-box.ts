import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  executeSearch,
  fetchQuerySuggestions,
} from '../../../features/insight-search/insight-search-actions';
import {Controller} from '../../controller/headless-controller';
import {
  buildCoreSearchBox,
  Delimiters,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from '../../core/search-box/headless-core-search-box';
import {SearchBoxOptions} from '../../core/search-box/headless-core-search-box-options';

export type {
  SearchBoxOptions,
  SearchBoxState,
  SuggestionHighlightingOptions,
  Suggestion,
  Delimiters,
};

export interface InsightSearchBoxProps {
  /**
   * The `InsightSearchBox` controller options.
   */
  options?: SearchBoxOptions;
}

/**
 * The `InsightSearchBox` headless controller offers a high-level interface for designing a common search box UI controller
 * with [highlighting for query suggestions](https://docs.coveo.com/en/headless/latest/usage/highlighting/).
 */
export interface InsightSearchBox extends Controller {
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
 * Creates an `InsightSearchBox` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns An `InsightSearchBox` controller instance.
 */
export function buildInsightSearchBox(
  engine: InsightEngine,
  props: InsightSearchBoxProps = {}
): InsightSearchBox {
  return buildCoreSearchBox(engine, {
    ...props,
    executeSearchActionCreator: executeSearch,
    fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
  });
}
