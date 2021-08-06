import {
  configuration,
  query,
  querySuggest,
  standaloneSearchBoxSet,
  redirection,
} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {selectQuerySuggestion} from '../../features/query-suggest/query-suggest-actions';
import {buildOmniboxSuggestionMetadata} from '../../features/query-suggest/query-suggest-analytics-actions';
import {updateQuery} from '../../features/query/query-actions';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
} from '../../features/standalone-search-box-set/standalone-search-box-set-actions';
import {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state';
import {
  ConfigurationSection,
  QuerySection,
  QuerySuggestionSection,
  StandaloneSearchBoxSection,
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

export {StandaloneSearchBoxOptions, StandaloneSearchBoxAnalytics};

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
  analytics: StandaloneSearchBoxAnalytics;

  /**
   * The Url to redirect to.
   */
  redirectTo: string | null;
}

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
  dispatch(
    registerStandaloneSearchBox({id, redirectionUrl: options.redirectionUrl})
  );

  return {
    ...searchBox,

    updateText(value: string) {
      searchBox.updateText(value);
      dispatch(updateAnalyticsToSearchFromLink({id}));
    },

    selectSuggestion(value: string) {
      const metadata = buildOmniboxSuggestionMetadata(getState(), {
        id,
        suggestion: value,
      });

      dispatch(selectQuerySuggestion({id, expression: value}));
      dispatch(updateAnalyticsToOmniboxFromLink({id, metadata}));

      this.submit();
    },

    submit() {
      dispatch(
        updateQuery({
          q: this.state.value,
          enableQuerySyntax: options.enableQuerySyntax,
        })
      );
      dispatch(fetchRedirectUrl({id}));
    },

    get state() {
      const state = getState();
      const standaloneSearchBoxState = state.standaloneSearchBoxSet[id]!;
      return {
        ...searchBox.state,
        isLoading: standaloneSearchBoxState.isLoading,
        redirectTo: standaloneSearchBoxState.redirectTo,
        analytics: standaloneSearchBoxState.analytics,
      };
    },
  };
}

function loadStandaloneSearchBoxReducers(
  engine: SearchEngine
): engine is SearchEngine<
  StandaloneSearchBoxSection &
    ConfigurationSection &
    QuerySection &
    QuerySuggestionSection
> {
  engine.addReducers({
    standaloneSearchBoxSet,
    configuration,
    query,
    querySuggest,
    redirection,
  });
  return true;
}
