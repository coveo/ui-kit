import {OmniboxSuggestionsMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
import {
  configuration,
  query,
  redirection,
  querySuggest,
} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {selectQuerySuggestion} from '../../features/query-suggest/query-suggest-actions';
import {buildOmniboxSuggestionMetadata} from '../../features/query-suggest/query-suggest-analytics-actions';
import {updateQuery} from '../../features/query/query-actions';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {
  ConfigurationSection,
  QuerySection,
  QuerySuggestionSection,
  RedirectionSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {randomID} from '../../utils/utils';
import {validateOptions} from '../../utils/validate-payload';
import {
  buildSearchBox,
  SearchBox,
  SearchBoxState,
} from '../search-box/headless-search-box';
import {defaultSearchBoxOptions} from '../search-box/headless-search-box-options';
import {
  StandaloneSearchBoxOptions,
  standaloneSearchBoxSchema,
} from './headless-standalone-search-box-options';

export {StandaloneSearchBoxOptions};

export interface StandaloneSearchBoxProps {
  options: StandaloneSearchBoxOptions;
}

/**
 * The `StandaloneSearchBox` headless controller offers a high-level interface for designing a common search box UI controller.
 * Meant to be used for a search box that will redirect instead of executing a query.
 */
export interface StandaloneSearchBox extends SearchBox {
  /**
   * Triggers a redirection.
   */
  submit(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `StandaloneSearchBox` controller.
   */
  state: StandaloneSearchBoxState;
}

export interface StandaloneSearchBoxState extends SearchBoxState {
  /**
   * The analytics data to send when performing the first query on the search page the user is redirected to.
   */
  analytics: StandaloneSearchBoxAnalyticsData;

  /**
   * The Url to redirect to.
   */
  redirectTo: string | null;
}

interface InitialData {
  cause: '';
  metadata: null;
}

interface SearchFromLinkData {
  cause: 'searchFromLink';
  metadata: null;
}

interface OmniboxFromLinkData {
  cause: 'omniboxFromLink';
  metadata: OmniboxSuggestionsMetadata;
}

type StandaloneSearchBoxAnalyticsData =
  | InitialData
  | SearchFromLinkData
  | OmniboxFromLinkData;

/**
 * Creates a `StandaloneSearchBox` instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `StandaloneSearchBox` properties.
 * @returns A `StandaloneSearchBox` instance.
 */
export function buildStandaloneSearchBox(
  engine: SearchEngine,
  props: StandaloneSearchBoxProps
): StandaloneSearchBox {
  if (!loadStandaloneSearchBoxReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state;

  const id = props.options.id || randomID('standalone_search_box');
  const options: Required<StandaloneSearchBoxOptions> = {
    id,
    highlightOptions: {...props.options.highlightOptions},
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  validateOptions(
    engine,
    standaloneSearchBoxSchema,
    options,
    'buildStandaloneSearchBox'
  );

  const searchBox = buildSearchBox(engine, {options});

  let analytics: StandaloneSearchBoxAnalyticsData = {
    cause: '',
    metadata: null,
  };

  return {
    ...searchBox,

    updateText(value: string) {
      analytics = buildSearchFromLinkData();
      searchBox.updateText(value);
    },

    selectSuggestion(value: string) {
      analytics = buildOmniboxFromLinkData(getState(), id, value);
      dispatch(selectQuerySuggestion({id, expression: value}));
      this.submit();
    },

    submit() {
      dispatch(
        updateQuery({
          q: this.state.value,
          enableQuerySyntax: options.enableQuerySyntax,
        })
      );
      dispatch(
        checkForRedirection({defaultRedirectionUrl: options.redirectionUrl})
      );
    },

    get state() {
      const state = getState();
      return {
        ...searchBox.state,
        redirectTo: state.redirection.redirectTo,
        analytics,
      };
    },
  };
}

function loadStandaloneSearchBoxReducers(
  engine: SearchEngine
): engine is SearchEngine<
  RedirectionSection &
    ConfigurationSection &
    QuerySection &
    QuerySuggestionSection
> {
  engine.addReducers({redirection, configuration, query, querySuggest});
  return true;
}

function buildSearchFromLinkData(): SearchFromLinkData {
  return {
    cause: 'searchFromLink',
    metadata: null,
  };
}

function buildOmniboxFromLinkData(
  state: QuerySuggestionSection,
  id: string,
  suggestion: string
): OmniboxFromLinkData {
  return {
    cause: 'omniboxFromLink',
    metadata: buildOmniboxSuggestionMetadata(state, {id, suggestion}),
  };
}
