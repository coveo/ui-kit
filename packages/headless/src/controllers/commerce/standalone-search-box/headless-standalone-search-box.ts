import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {stateKey} from '../../../app/state-key';
import {selectQuerySuggestion} from '../../../features/commerce/query-suggest/query-suggest-actions';
import {updateQuery} from '../../../features/commerce/query/query-actions';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateStandaloneSearchBoxRedirectionUrl,
} from '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-actions';
import {commerceStandaloneSearchBoxSetReducer as commerceStandaloneSearchBoxSet} from '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-slice';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice';
import {
  CommerceQuerySection,
  ConfigurationSection,
  QuerySuggestionSection,
  CommerceStandaloneSearchBoxSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {randomID} from '../../../utils/utils';
import {validateOptions} from '../../../utils/validate-payload';
import {StandaloneSearchBoxProps} from '../../standalone-search-box/headless-standalone-search-box';
import {
  SearchBox,
  SearchBoxState,
  buildSearchBox,
} from '../search-box/headless-search-box';
import {defaultSearchBoxOptions} from '../search-box/headless-search-box-options';
import {
  StandaloneSearchBoxOptions,
  standaloneSearchBoxSchema,
} from './headless-standalone-search-box-options';

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

export interface StandaloneSearchBoxState extends SearchBoxState {
  /**
   * The URL to redirect to.
   */
  redirectTo: string;
}

/**
 * Creates a `StandaloneSearchBox` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `StandaloneSearchBox` properties.
 * @returns A `StandaloneSearchBox` controller instance.
 */
export function buildStandaloneSearchBox(
  engine: CommerceEngine,
  props: StandaloneSearchBoxProps
): StandaloneSearchBox {
  if (!loadStandaloneSearchBoxReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine[stateKey];

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
    },

    selectSuggestion(value: string) {
      dispatch(selectQuerySuggestion({id, expression: value}));

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
          query: this.state.value,
        })
      );
      dispatch(fetchRedirectUrl({id}));
    },

    get state() {
      const state = getState();
      const standaloneSearchBoxState =
        state.commerceStandaloneSearchBoxSet[id]!;
      return {
        ...searchBox.state,
        redirectTo: standaloneSearchBoxState.redirectTo,
      };
    },
  };
}

function loadStandaloneSearchBoxReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  CommerceStandaloneSearchBoxSection &
    ConfigurationSection &
    CommerceQuerySection &
    QuerySuggestionSection
> {
  engine.addReducers({
    commerceQuery,
    commerceStandaloneSearchBoxSet,
    configuration,
    querySuggest,
  });
  return true;
}
