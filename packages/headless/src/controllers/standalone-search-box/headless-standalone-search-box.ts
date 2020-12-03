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
import {buildSearchBox} from '../search-box/headless-search-box';
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
 * A scoped and simplified part of the headless state that is relevant to the `StandaloneSearchBox` controller.
 */
export type StandaloneSearchBoxState = StandaloneSearchBox['state'];
/**
 * The `StandaloneSearchBox` headless controller offers a high-level interface for designing a common search box UI controller.
 * Meant to be used for a search box that will redirect instead of executing a query.
 */
export type StandaloneSearchBox = ReturnType<typeof buildStandaloneSearchBox>;

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
) {
  const {dispatch} = engine;
  const id = props.options.id || randomID('standalone_search_box');
  const options: Required<StandaloneSearchBoxOptions> = {
    id,
    ...defaultSearchBoxOptions,
    ...props.options,
  };

  validateOptions(engine, 
    standaloneSearchBoxSchema,
    options,
    buildStandaloneSearchBox.name
  );

  const searchBox = buildSearchBox(engine, {options});

  return {
    ...searchBox,

    /**
     * Selects a suggestion and calls `submit`.
     * @param value The string value of the suggestion to select
     */
    selectSuggestion(value: string) {
      dispatch(selectQuerySuggestion({id, expression: value}));
      this.submit();
    },

    /**
     * Triggers a redirection.
     */
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

    /**
     * @returns The state of the `StandaloneSearchBox` controller.
     */
    get state() {
      const state = engine.state;
      return {
        ...searchBox.state,
        redirectTo: state.redirection.redirectTo,
      };
    },
  };
}
