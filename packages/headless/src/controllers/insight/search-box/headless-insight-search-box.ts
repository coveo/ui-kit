import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {SearchAction} from '../../../features/analytics/analytics-utils';
import {
  executeSearch,
  fetchQuerySuggestions,
} from '../../../features/insight-search/insight-search-actions';
import {clearQuerySuggest} from '../../../features/query-suggest/query-suggest-actions';
import {logSearchboxSubmit} from '../../../features/query/query-insight-analytics-actions';
import {prepareForSearchWithQuery} from '../../../features/search/search-actions';
import {randomID} from '../../../utils/utils';
import {
  buildCoreSearchBox,
  Delimiters,
  SearchBox,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from '../../core/search-box/headless-core-search-box';
import {
  defaultSearchBoxOptions,
  SearchBoxOptions,
} from '../../core/search-box/headless-core-search-box-options';

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
  const {dispatch} = engine;
  const searchBox = buildCoreSearchBox(engine, {
    ...props,
    executeSearchActionCreator: executeSearch,
    fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
  });
  const id = props.options?.id || randomID('search_box');
  const options: Required<SearchBoxOptions> = {
    id,
    highlightOptions: {...props.options?.highlightOptions},
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  const getValue = () => engine.state.querySet?.[options.id];

  const performSearch = async (analytics: SearchAction) => {
    const {enableQuerySyntax, clearFilters} = options;

    dispatch(
      prepareForSearchWithQuery({
        q: getValue(),
        enableQuerySyntax,
        clearFilters,
      })
    );

    await dispatch(executeSearch(analytics));
  };

  return {
    ...searchBox,
    submit() {
      performSearch(logSearchboxSubmit());
      dispatch(clearQuerySuggest({id}));
    },
  };
}
