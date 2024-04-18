import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions';
import {selectPage} from '../../../features/commerce/pagination/pagination-actions';
import {fetchQuerySuggestions} from '../../../features/commerce/query-suggest/query-suggest-actions';
import {updateQuery} from '../../../features/commerce/query/query-actions';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {updateFacetAutoSelection} from '../../../features/facets/generic/facet-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/query-set/query-set-actions';
import {querySetReducer as querySet} from '../../../features/query-set/query-set-slice';
import {
  clearQuerySuggest,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/query-suggest/query-suggest-actions';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice';
import {
  CommerceQuerySection,
  CommerceSearchSection,
  ConfigurationSection,
  QuerySetSection,
  QuerySuggestionSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  Delimiters,
  SuggestionHighlightingOptions,
} from '../../../utils/highlight';
import {randomID} from '../../../utils/utils';
import {validateOptions} from '../../../utils/validate-payload';
import {buildController} from '../../controller/headless-controller';
import {
  getSuggestions,
  SearchBoxState,
  SearchBox as CoreSearchBox,
  Suggestion,
} from '../../core/search-box/headless-core-search-box';
import {
  defaultSearchBoxOptions,
  SearchBoxOptions,
  searchBoxOptionsSchema,
} from './headless-search-box-options';

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
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI component
 * with [highlighting for query suggestions](https://docs.coveo.com/en/headless/latest/usage/highlighting/).
 */
export type SearchBox = Omit<CoreSearchBox, 'submit'> & {
  /**
   * Triggers a commerce search query.
   */
  submit(): void;
};

/**
 * Creates a `SearchBox` controller instance.
 *
 * @param engine - The commerce headless engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `SearchBox` controller instance.
 */
export function buildSearchBox(
  engine: CommerceEngine,
  props: SearchBoxProps = {}
): SearchBox {
  if (!loadSearchBoxReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const id = props.options?.id || randomID('search_box');
  const options: Required<SearchBoxOptions> = {
    id,
    highlightOptions: {...props.options?.highlightOptions},
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  validateOptions(engine, searchBoxOptionsSchema, options, 'buildSearchBox');
  dispatch(
    registerQuerySetQuery({id, query: engine.state.commerceQuery.query ?? ''})
  );
  dispatch(registerQuerySuggest({id}));

  const getValue = () => engine.state.querySet[options.id];

  const performSearch = async () => {
    if (options.clearFilters) {
      dispatch(deselectAllBreadcrumbs());
    }

    dispatch(updateFacetAutoSelection({allow: true}));
    dispatch(updateQuery({query: getValue()}));
    dispatch(selectPage(0));
    dispatch(executeSearch({sliceId: 'default'}));
  };

  return {
    ...controller,

    updateText(value: string) {
      dispatch(updateQuerySetQuery({id, query: value}));
      this.showSuggestions();
    },

    clear() {
      dispatch(updateQuerySetQuery({id, query: ''}));
      dispatch(clearQuerySuggest({id}));
    },

    showSuggestions() {
      dispatch(fetchQuerySuggestions({id}));
    },

    selectSuggestion(value: string) {
      dispatch(selectQuerySuggestion({id, expression: value}));
      performSearch().then(() => {
        dispatch(clearQuerySuggest({id}));
      });
    },

    submit() {
      performSearch();
      dispatch(clearQuerySuggest({id}));
    },

    get state() {
      const state = getState();
      const querySuggest = state.querySuggest[options.id];
      const suggestions = getSuggestions(
        querySuggest,
        options.highlightOptions
      );
      const isLoadingSuggestions = querySuggest
        ? querySuggest.isLoading
        : false;

      return {
        value: getValue(),
        suggestions,
        isLoading: state.commerceSearch.isLoading,
        isLoadingSuggestions,
      };
    },
  };
}

function loadSearchBoxReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  CommerceQuerySection &
    QuerySuggestionSection &
    ConfigurationSection &
    QuerySetSection &
    CommerceSearchSection
> {
  engine.addReducers({
    commerceQuery,
    querySuggest,
    configuration,
    querySet,
    commerceSearch,
  });
  return true;
}
