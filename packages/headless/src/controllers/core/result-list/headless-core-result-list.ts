import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import {AsyncThunkAction} from '@reduxjs/toolkit';
import {Result} from '../../../api/search/search/result';
import {CoreEngine} from '../../../app/engine';
import {configuration, fields, search} from '../../../app/reducers';
import {registerFieldsToInclude} from '../../../features/fields/fields-actions';
import {
  ConfigurationSection,
  FieldsSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {validateOptions} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {buildCoreStatus, CoreStatusState} from '../status/headless-core-status';

const optionsSchema = new Schema<CoreResultListOptions>({
  fieldsToInclude: new ArrayValue({
    required: false,
    each: new StringValue<string>({
      required: true,
      emptyAllowed: false,
    }),
  }),
});

export interface CoreResultListOptions {
  /**
   * A list of indexed fields to include in the objects returned by the result list.
   * These results are included in addition to the default fields.
   * If this is left empty only the default fields are included.
   */
  fieldsToInclude?: string[];
}

export interface CoreResultListProps {
  /**
   * The options for the `ResultList` controller.
   * */
  options?: CoreResultListOptions;

  /**
   * The action creator to build the `fetchMoreResults` action.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchMoreResultsActionCreator?: () => AsyncThunkAction<unknown, void, any>;
}

/**
 * The `CoreResultList` headless controller offers a high-level interface for designing a common result list UI controller.
 */
export interface CoreResultList extends Controller {
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
  state: CoreResultListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ResultList` controller.
 * */
export interface CoreResultListState extends CoreStatusState {
  /**
   * The results of the last executed search.
   * */
  results: Result[];
  /**
   * The unique identifier of the last executed search.
   * @deprecated - Use the `searchResponseId` instead.
   */
  searchUid: string;
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
 * Creates a `CoreResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultList` properties.
 * @returns A `CoreResultList` controller instance.
 */
export function buildCoreResultList(
  engine: CoreEngine,
  props?: CoreResultListProps
): CoreResultList {
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
    if (props?.fetchMoreResultsActionCreator) {
      dispatch(props?.fetchMoreResultsActionCreator()).then(
        () => (lastFetchCompleted = Date.now())
      );
    }
  };

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        ...status.state,
        results: state.search.results,
        searchUid: state.search.response.searchUid,
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
