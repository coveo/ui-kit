import {Engine} from '../../app/headless-engine';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {fetchMoreResults} from '../../features/search/search-actions';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';
import {Schema, ArrayValue, StringValue, SchemaDefinition} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';
import {
  buildSearchStatus,
  SearchStatusState,
} from '../search-status/headless-search-status';
import {Result} from '../../api/search/search/result';
import {configuration, search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';

export const resultListOptionsSchemaDefinition: SchemaDefinition<Required<
  ResultListOptions
>> = {
  fieldsToInclude: new ArrayValue({
    required: false,
    each: new StringValue<string>({
      required: true,
      emptyAllowed: false,
    }),
  }),
};

const optionsSchema = new Schema<ResultListOptions>(
  resultListOptionsSchemaDefinition
);

export interface ResultListOptions {
  /**
   * A list of indexed fields to include in the objects returned by the result list.
   * These results are included in addition to the default fields.
   * If this is left empty only the default fields are included.
   */
  fieldsToInclude?: string[];
}

export interface ResultListProps {
  /**
   * The options for the `ResultList` controller.
   * */
  options?: ResultListOptions;
}

/**
 * The `ResultList` headless controller offers a high-level interface for designing a common result list UI controller.
 */
export interface ResultList extends Controller {
  /**
   * Using the same parameters as the last successful query, fetch another batch of results, if available.
   * Particularly useful for infinite scrolling, for example.
   *
   * This method is not compatible with the `Pager` controller.
   */
  fetchMoreResults(): void;

  /**
   * The state of the `ResultList` controller.
   */
  state: ResultListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ResultList` controller.
 * */
export interface ResultListState extends SearchStatusState {
  /**
   * The results of the last executed search.
   * */
  results: Result[];
  /**
   * The unique identifier of the last executed search.
   */
  searchUid: string;
  /**
   * Whether more results are available, using the same parameters as the last successful query.
   *
   * This property is not compatible with the `Pager` controller.
   */
  moreResultsAvailable: boolean;
}

/**
 * Creates a `ResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultList` properties.
 * @returns A `ResultList` controller instance.
 */
export function buildResultList(
  engine: Engine<object>,
  props?: ResultListProps
): ResultList {
  if (!loadResultListReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const searchStatus = buildSearchStatus(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = validateOptions(
    engine,
    optionsSchema,
    props?.options,
    'buildResultList'
  );

  if (options.fieldsToInclude) {
    dispatch(registerFieldsToInclude(options.fieldsToInclude));
  }

  const moreResultsAvailable = () =>
    engine.state.search.results.length <
    engine.state.search.response.totalCountFiltered;

  let lastFetchCompleted = 0;
  let consecutiveFetches = 0;
  const maxConsecutiveFetches = 5;
  const minDelayBetweenFetches = 200;
  let errorLogged = false;

  const triggerFetchMoreResult = () => {
    if (engine.state.search.isLoading) {
      return;
    }

    if (!moreResultsAvailable()) {
      engine.logger.info(
        'No more results are available for the result list to fetch.'
      );
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

    get state() {
      const state = getState();

      return {
        ...searchStatus.state,
        results: state.search.results,
        searchUid: state.search.response.searchUid,
        moreResultsAvailable: moreResultsAvailable(),
      };
    },

    fetchMoreResults: triggerFetchMoreResult,
  };
}

function loadResultListReducers(
  engine: Engine<object>
): engine is Engine<SearchSection & ConfigurationSection> {
  engine.addReducers({search, configuration});
  return true;
}
