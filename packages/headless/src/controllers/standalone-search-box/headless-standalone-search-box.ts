import {Engine} from '../../app/headless-engine';
import {selectQuerySuggestion} from '../../features/query-suggest/query-suggest-actions';
import {updateQuery} from '../../features/query/query-actions';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {
  ConfigurationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  RedirectionSection,
  SearchSection,
} from '../../state/state-sections';
import {randomID} from '../../utils/utils';
import {validateOptions} from '../../utils/validate-payload';
import {Controller} from '../controller/headless-controller';
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
export interface StandaloneSearchBox extends SearchBox, Controller {
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
  engine: Engine<
    ConfigurationSection &
      RedirectionSection &
      QuerySection &
      QuerySuggestionSection &
      QuerySetSection &
      SearchSection
  >,
  props: StandaloneSearchBoxProps
): StandaloneSearchBox {
  const {dispatch} = engine;
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

  return {
    ...searchBox,

    selectSuggestion(value: string) {
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
      const state = engine.state;
      return {
        ...searchBox.state,
        redirectTo: state.redirection.redirectTo,
      };
    },
  };
}
