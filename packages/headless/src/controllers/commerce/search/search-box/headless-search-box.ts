import {logSearchboxSubmit} from '../../../../features/query/query-analytics-actions';
import {executeSearch, fetchQuerySuggestions} from '../../../../features/commerce/search/search-actions';
import {SuggestionHighlightingOptions, Delimiters} from '../../../../utils/highlight';
import {
  buildCoreSearchBox, SearchBox,
  SearchBoxState,
  Suggestion,
} from '../../../core/search-box/headless-core-search-box';
import {SearchBoxOptions} from '../../../core/search-box/headless-core-search-box-options';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';

export type {
  SearchBoxOptions,
  SearchBoxState,
  SuggestionHighlightingOptions,
  Suggestion,
  SearchBox,
  Delimiters,
};

export interface SearchBoxProps {
  /**
   * The `SearchBox` controller options.
   */
  options?: SearchBoxOptions;
}

/**
 * Creates a commerce `SearchBox` controller instance.
 *
 * @param engine - The commerce engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 */
export function buildSearchBox(
  engine: CommerceEngine,
  props: SearchBoxProps = {}
): SearchBox {
  const searchBox = buildCoreSearchBox(engine, {
    ...props,
    executeSearchActionCreator: executeSearch,
    fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
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
