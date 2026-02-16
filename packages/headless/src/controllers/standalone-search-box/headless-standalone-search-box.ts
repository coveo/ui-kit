import {configuration} from '../../app/common-reducers.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {updateQuery} from '../../features/query/query-actions.js';
import {queryReducer as query} from '../../features/query/query-slice.js';
import {selectQuerySuggestion} from '../../features/query-suggest/query-suggest-actions.js';
import {buildOmniboxSuggestionMetadata} from '../../features/query-suggest/query-suggest-analytics-actions.js';
import {querySuggestReducer as querySuggest} from '../../features/query-suggest/query-suggest-slice.js';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
  updateStandaloneSearchBoxRedirectionUrl,
} from '../../features/standalone-search-box-set/standalone-search-box-set-actions.js';
import {standaloneSearchBoxSetReducer as standaloneSearchBoxSet} from '../../features/standalone-search-box-set/standalone-search-box-set-slice.js';
import type {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state.js';
import type {
  ConfigurationSection,
  QuerySection,
  QuerySuggestionSection,
  StandaloneSearchBoxSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {randomID} from '../../utils/utils.js';
import {validateOptions} from '../../utils/validate-payload.js';
import {defaultSearchBoxOptions} from '../core/search-box/headless-core-search-box-options.js';
import {
  buildSearchBox,
  type SearchBox,
  type SearchBoxState,
} from '../search-box/headless-search-box.js';
import {
  type StandaloneSearchBoxOptions,
  standaloneSearchBoxSchema,
} from './headless-standalone-search-box-options.js';

export type {StandaloneSearchBoxOptions, StandaloneSearchBoxAnalytics};

export interface StandaloneSearchBoxProps {
  options: StandaloneSearchBoxOptions;
}

/**
 * The `StandaloneSearchBox` headless controller offers a high-level interface for designing a common search box UI controller.
 * Meant to be used for a search box that will redirect instead of executing a query.
 *
 * Example: [standalone-search-box.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/standalone-search-box/standalone-search-box.fn.tsx)
 *
 * @group Controllers
 * @category StandaloneSearchBox
 */
export interface StandaloneSearchBox extends SearchBox {
  /**
   * Triggers a redirection.
   */
  submit(): void;

  /**
   * Updates the redirection url of the standalone search box.
   * @param url - The new URL to redirect to.
   */
  updateRedirectUrl(url: string): void;

  /**
   * Resets the standalone search box state. To be dispatched on single page applications after the redirection has been triggered.
   */
  afterRedirection(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `StandaloneSearchBox` controller.
   */
  state: StandaloneSearchBoxState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `StandaloneSearchBox` controller.
 *
 * @group Controllers
 * @category StandaloneSearchBox
 */
export interface StandaloneSearchBoxState extends SearchBoxState {
  /**
   * The analytics data to send when performing the first query on the search page the user is redirected to.
   */
  analytics: StandaloneSearchBoxAnalytics;

  /**
   * The Url to redirect to.
   */
  redirectTo: string;
}

/**
 * Creates a `StandaloneSearchBox` instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `StandaloneSearchBox` properties.
 * @returns A `StandaloneSearchBox` instance.
 *
 * @group Controllers
 * @category StandaloneSearchBox
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
    ...{overwrite: false},
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
    registerStandaloneSearchBox({
      id,
      redirectionUrl: options.redirectionUrl,
      overwrite: options.overwrite,
    })
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

    afterRedirection() {
      dispatch(resetStandaloneSearchBox({id}));
    },

    updateRedirectUrl(url: string) {
      dispatch(
        updateStandaloneSearchBoxRedirectionUrl({id, redirectionUrl: url})
      );
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
  });
  return true;
}
