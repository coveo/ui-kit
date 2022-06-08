import {
  ConfigurationSection,
  FieldsSection,
  SearchSection,
} from '../../state/state-sections';
import {fetchMoreResults} from '../../features/search/search-actions';
import {configuration, fields, search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreResultList,
  CoreResultListOptions,
  CoreResultListState,
} from '../core/result-list/headless-core-result-list';
import {Controller} from '../controller/headless-controller';

export interface ResultListOptions extends CoreResultListOptions {}

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
export interface ResultListState extends CoreResultListState {}

/**
 * Creates a `ResultList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultList` properties.
 * @returns A `ResultList` controller instance.
 */
export function buildResultList(
  engine: SearchEngine,
  props?: ResultListProps
): ResultList {
  if (!loadResultListReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreResultList(engine, {
    ...props,
    fetchMoreResultsActionCreator: fetchMoreResults,
  });

  return {
    ...coreController,

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}

function loadResultListReducers(
  engine: SearchEngine
): engine is SearchEngine<
  SearchSection & ConfigurationSection & FieldsSection
> {
  engine.addReducers({search, configuration, fields});
  return true;
}
