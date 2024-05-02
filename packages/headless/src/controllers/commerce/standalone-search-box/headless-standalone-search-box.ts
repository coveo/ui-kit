import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {stateKey} from '../../../app/engine';
import {updateQuery} from '../../../features/commerce/query/query-actions';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
} from '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-actions';
import {standaloneSearchBoxSetReducer as standaloneSearchBoxSet} from '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-slice';
import {selectQuerySuggestion} from '../../../features/query-suggest/query-suggest-actions';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice';
import {
  CommerceQuerySection,
  ConfigurationSection,
  QuerySuggestionSection,
  CommerceStandaloneSearchBoxSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {randomID} from '../../../utils/utils';
import {validateOptionsNext} from '../../../utils/validate-payload';
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
   * The Url to redirect to.
   */
  redirectTo: string;
}

/**
 * Creates a `StandaloneSearchBox` controller instance.
 *
 * @param engine - The commerce headless engine.
 * @param props - The configurable `SearchBox` properties.
 * @returns A `StandaloneSearchBoxProps` controller instance.
 *
 * @internal
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
    ...props.options,
  };

  validateOptionsNext(
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
    },

    selectSuggestion(value: string) {
      dispatch(selectQuerySuggestion({id, expression: value}));

      this.submit();
    },

    afterRedirection() {
      dispatch(resetStandaloneSearchBox({id}));
    },

    submit() {
      dispatch(
        updateQuery({
          query: this.state.value,
        })
      );
      dispatch(
        fetchRedirectUrl({
          id,
          // TODO: KIT-3134: remove once the `search/redirect` endpoint is implemented.
          // In the meantime, we simply use the redirection URL provided in the props
          redirectionUrl: props.options.redirectionUrl,
        })
      );
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
    commerceStandaloneSearchBoxSet: standaloneSearchBoxSet,
    configuration,
    querySuggest,
  });
  return true;
}
