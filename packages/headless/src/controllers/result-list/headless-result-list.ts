import {Engine} from '../../app/headless-engine';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {fetchMoreResults} from '../../features/search/search-actions';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';
import {Schema, ArrayValue, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';

const optionsSchema = new Schema<ResultListOptions>({
  /**
   * A list of indexed fields to include in the objects returned by the result list.
   * These results are included in addition to the default fields.
   * If this is left empty only the default fields are included.
   */
  fieldsToInclude: new ArrayValue({
    required: false,
    each: new StringValue<string>({
      required: true,
      emptyAllowed: false,
    }),
  }),
});

type ResultListOptions = {
  fieldsToInclude?: string[];
};

type ResultListProps = {
  options?: ResultListOptions;
};

/** The state relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
export type ResultList = ReturnType<typeof buildResultList>;

export function buildResultList(
  engine: Engine<SearchSection & ConfigurationSection>,
  props?: ResultListProps
) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    engine,
    optionsSchema,
    props?.options,
    buildResultList.name
  );

  if (options.fieldsToInclude) {
    dispatch(registerFieldsToInclude(options.fieldsToInclude));
  }

  return {
    ...controller,

    /**
     * @returns The state of the `ResultList` controller.
     */
    get state() {
      const state = engine.state;

      return {
        results: state.search.results,
        isLoading: state.search.isLoading,
      };
    },
    /**
     * Using the same parameters as the last successful query, fetch another batch of results. Particularly useful for infinite scrolling, for example.
     */
    fetchMoreResults() {
      dispatch(fetchMoreResults());
    },
  };
}
