import {Engine} from '../../app/headless-engine';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {fetchMoreResults} from '../../features/search/search-actions';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';
import {Schema, ArrayValue, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';
import {buildSearchStatus} from '../search-status/headless-search-status';

const optionsSchema = new Schema<ResultListOptions>({
  fieldsToInclude: new ArrayValue({
    required: false,
    each: new StringValue<string>({
      required: true,
      emptyAllowed: false,
    }),
  }),
});

type ResultListOptions = {
  /**
   * A list of indexed fields to include in the objects returned by the result list.
   * These results are included in addition to the default fields.
   * If this is left empty only the default fields are included.
   */
  fieldsToInclude?: string[];
};

type ResultListProps = {
  /** The options for the `ResultList` controller. */
  options?: ResultListOptions;
};

/** A scoped and simplified part of the headless state that is relevant to the `ResultList` controller.*/
export type ResultListState = ResultList['state'];
/**
 * The `ResultList` headless controller offers a high-level interface for designing a common result list UI controller.
 */
export type ResultList = ReturnType<typeof buildResultList>;

export function buildResultList(
  engine: Engine<SearchSection & ConfigurationSection>,
  props?: ResultListProps
) {
  const controller = buildController(engine);
  const searchStatus = buildSearchStatus(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    engine,
    optionsSchema,
    props?.options,
    'buildResultList'
  );

  if (options.fieldsToInclude) {
    dispatch(registerFieldsToInclude(options.fieldsToInclude));
  }

  let lastFetchCompleted = 0;
  let consecutiveFetches = 0;
  const maxConsecutiveFetches = 5;
  const minDelayBetweenFetches = 200;
  let errorLogged = false;

  const triggerFetchMoreResult = () => {
    if (engine.state.search.isLoading) {
      return;
    }

    const delayBetweenFetches = Date.now() - lastFetchCompleted;
    if (delayBetweenFetches < minDelayBetweenFetches) {
      consecutiveFetches++;
      if (consecutiveFetches >= maxConsecutiveFetches) {
        lastFetchCompleted = Date.now();
        !errorLogged &&
          engine.logger.error(
            `The result list method "fetchMoreResults" execution prevented because it has been triggered consecutively ${maxConsecutiveFetches} times, with little delay. Please verify the conditions under which the function is called.`
          );
        errorLogged = true;
        return;
      }
    } else {
      consecutiveFetches = 0;
    }

    errorLogged = false;
    dispatch(fetchMoreResults()).then(() => (lastFetchCompleted = Date.now()));
  };

  return {
    ...controller,

    /**
     * The state of the `ResultList` controller.
     */
    get state() {
      const state = engine.state;

      return {
        ...searchStatus.state,
        /** The results of the last executed search. */
        results: state.search.results,
      };
    },
    /**
     * Using the same parameters as the last successful query, fetch another batch of results. Particularly useful for infinite scrolling, for example.
     */
    fetchMoreResults: triggerFetchMoreResult,
  };
}
