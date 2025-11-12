import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {Result} from '../../../api/search/search/result.js';
import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import {registerFieldsToInclude} from '../../../features/fields/fields-actions.js';
import {fieldsReducer as fields} from '../../../features/fields/fields-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  FieldsSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {validateOptions} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  buildCoreStatus,
  type SearchStatusState,
} from '../status/headless-core-status.js';

const optionsSchema = new Schema<ResultListOptions>({
  fieldsToInclude: new ArrayValue({
    required: false,
    each: new StringValue<string>({
      required: true,
      emptyAllowed: false,
    }),
  }),
});

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
  /**
   * The action creator to build the `fetchMoreResults` action.
   */

  // biome-ignore lint/suspicious/noExplicitAny: third-party type uses 'any'
  fetchMoreResultsActionCreator?: () => AsyncThunkAction<unknown, void, any>;
}

/**
 * The `ResultList` headless controller offers a high-level interface for designing a common result list UI controller.
 *
 * Example: [result-list.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/result-list/result-list.fn.tsx)
 *
 * @group Controllers
 * @category ResultList
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
 *
 * @group Controllers
 * @category ResultList
 * */
export interface ResultListState extends SearchStatusState {
  /**
   * The results of the last executed search.
   * */
  results: Result[];
  /**
   * The unique identifier of the response where the results were fetched, this value does not change when loading more results.
   */
  searchResponseId: string;
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
export function buildCoreResultList(
  engine: CoreEngine,
  props?: ResultListProps
): ResultList {
  if (!loadResultListReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const status = buildCoreStatus(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = validateOptions(
    engine,
    optionsSchema,
    props?.options,
    'buildCoreResultList'
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

  const triggerFetchMoreResult = async () => {
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
    if (props?.fetchMoreResultsActionCreator) {
      await dispatch(props?.fetchMoreResultsActionCreator());
      lastFetchCompleted = Date.now();
    }
  };

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        ...status.state,
        results: state.search.results,
        moreResultsAvailable: moreResultsAvailable(),
        searchResponseId: state.search.searchResponseId,
      };
    },

    fetchMoreResults: triggerFetchMoreResult,
  };
}

function loadResultListReducers(
  engine: CoreEngine
): engine is CoreEngine<SearchSection & ConfigurationSection & FieldsSection> {
  engine.addReducers({search, configuration, fields});
  return true;
}
