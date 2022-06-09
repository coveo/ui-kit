import {insightSearch} from '../../../app/reducers';
import {insightFetchMoreResults} from '../../../features/insight-search/insight-search-actions';
import {InsightEngine} from '../../../insight.index';
import {
  ConfigurationSection,
  FieldsSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {Controller} from '../../controller/headless-controller';
import {
  buildCoreResultList,
  CoreResultListOptions,
  CoreResultListState,
} from '../../core/result-list/headless-core-result-list';

export interface InsightResultListOptions extends CoreResultListOptions {}

export interface InsightResultListProps {
  /**
   * The options for the `ResultList` controller.
   */
  options?: CoreResultListOptions;
}

export interface InsightResultList extends Controller {
  /**
   * Using the same parameters as the last successful query, fetch another batch of results, if available.
   * Particularly useful for infinite scrolling, for example.
   *
   * This method is not compatible with the `Pager` controller.
   */
  fetchMoreResults(): void;

  /**
   * The state of the `InsightResultList` controller.
   */
  state: InsightResultListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `InsightResultList` controller.
 * */
export interface InsightResultListState extends CoreResultListState {}

export function buildInsightResultList(
  engine: InsightEngine,
  props?: InsightResultListProps
): InsightResultList {
  if (!loadResultListReducers(engine)) {
    throw loadReducerError;
  }

  return buildCoreResultList(engine, {
    ...props,
    fetchMoreResultsActionCreator: insightFetchMoreResults,
  });
}

function loadResultListReducers(
  engine: InsightEngine
): engine is InsightEngine<
  SearchSection & ConfigurationSection & FieldsSection
> {
  // TODO: We'll eventually remove the `insightSearch` reducer from there.
  engine.addReducers({insightSearch});
  return true;
}
