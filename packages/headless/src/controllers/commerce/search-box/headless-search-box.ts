import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {configuration} from '../../../app/common-reducers.js';
import {stateKey} from '../../../app/state-key.js';
import type {UpdateQueryPayload} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/commerce/query-set/query-set-actions.js';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/commerce/query-suggest/query-suggest-actions.js';
import {
  executeSearch,
  type PrepareForSearchWithQueryOptions,
  prepareForSearchWithQuery,
} from '../../../features/commerce/search/search-actions.js';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice.js';
import {querySetReducer as querySet} from '../../../features/query-set/query-set-slice.js';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice.js';
import type {
  CommerceQuerySection,
  CommerceSearchSection,
  ConfigurationSection,
  QuerySetSection,
  QuerySuggestionSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {randomID} from '../../../utils/utils.js';
import {validateOptions} from '../../../utils/validate-payload.js';
import {buildController} from '../../controller/headless-controller.js';
import {
  type SearchBox as CoreSearchBox,
  getSuggestions,
  type SearchBoxState,
  type Suggestion,
} from '../../core/search-box/headless-core-search-box.js';
import {
  defaultSearchBoxOptions,
  type SearchBoxOptions,
  searchBoxOptionsSchema,
} from './headless-search-box-options.js';

export type {SearchBoxOptions, SearchBoxState, Suggestion, CoreSearchBox};

export interface SearchBoxProps {
  /**
   * The `SearchBox` controller options.
   */
  options?: SearchBoxOptions;
}

/**
 * The `SearchBox` headless controller offers a high-level interface for designing a common search box UI component
 * with [highlighting for query suggestions](https://docs.coveo.com/en/headless/latest/usage/highlighting/).
 *
 * @group Buildable controllers
 * @category SearchBox
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
 *
 * @group Buildable controllers
 * @category SearchBox
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
  const getState = () => engine[stateKey];

  const id = props.options?.id || randomID('search_box');
  const options: Required<SearchBoxOptions> = {
    id,
    highlightOptions: {...props.options?.highlightOptions},
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  validateOptions(engine, searchBoxOptionsSchema, options, 'buildSearchBox');
  dispatch(
    registerQuerySetQuery({id, query: getState().commerceQuery.query ?? ''})
  );
  dispatch(registerQuerySuggest({id}));

  const getValue = () => getState().querySet[options.id];

  const performSearch = async () => {
    const queryOptions: UpdateQueryPayload & PrepareForSearchWithQueryOptions =
      {
        query: getValue(),
        clearFilters: options.clearFilters,
      };

    dispatch(prepareForSearchWithQuery(queryOptions));
    dispatch(executeSearch());
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
      const querySuggest = getState().querySuggest[options.id];
      const suggestions = getSuggestions(
        querySuggest,
        options.highlightOptions
      );
      const isLoadingSuggestions = querySuggest
        ? querySuggest.isLoading
        : false;

      return {
        searchBoxId: id,
        value: getValue(),
        suggestions,
        isLoading: getState().commerceSearch.isLoading,
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
