import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  executeSearch,
  fetchQuerySuggestions,
} from '../../../features/insight-search/insight-search-actions';
import {logSearchboxSubmit} from '../../../features/query/query-insight-analytics-actions';
import {
  buildCoreSearchBox,
  Delimiters,
  SearchBox,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from '../../core/search-box/headless-core-search-box';
import {SearchBoxOptions} from '../../core/search-box/headless-core-search-box-options';

export type {
  SearchBoxOptions,
  SearchBoxState,
  SearchBox,
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
 * Creates an insight `SearchBox` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 */
export function buildSearchBox(
  engine: InsightEngine,
  props: SearchBoxProps = {}
): SearchBox {
  const searchBox = buildCoreSearchBox(engine, {
    ...props,
    executeSearchActionCreator: executeSearch,
    fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
    isNextAnalyticsReady: false,
  });

  return {
    ...searchBox,
    submit() {
      searchBox.submit(logSearchboxSubmit());
    },
    get state() {
      return searchBox.state;
    },
  };
}
