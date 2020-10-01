import {Schema, SchemaValues, StringValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {updateQuery} from '../../features/query/query-actions';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {
  buildSearchBox,
  SearchBoxOptions,
} from '../search-box/headless-search-box';

const optionsSchema = new Schema({
  /**
   * The default Url the user should be redirected to, when a query is submitted.
   * If a query pipeline redirect is triggered, it will redirect to that Url instead.
   */
  redirectionUrl: new StringValue({
    required: true,
    emptyAllowed: false,
    url: true,
  }),
});

export type StandaloneSearchBoxOptions = Required<
  SchemaValues<typeof optionsSchema>
> &
  SearchBoxOptions;

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
  engine: Engine,
  props: StandaloneSearchBoxProps
) {
  const {dispatch} = engine;
  const searchBox = buildSearchBox(engine, props);

  const options = optionsSchema.validate(props.options) as Required<
    StandaloneSearchBoxOptions
  >;

  return {
    ...searchBox,

    /**
     * Triggers a redirection.
     */
    submit() {
      dispatch(updateQuery({q: this.state.value}));
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
