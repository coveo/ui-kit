import {SearchEngine} from '../../app/search-engine/search-engine';
import {updateQuery} from '../../features/query/query-actions';
import {queryReducer as query} from '../../features/query/query-slice';
import {executeSearch} from '../../features/search/search-actions';
import {
  logUndoTriggerQuery,
  undoTriggerQuery,
} from '../../features/triggers/trigger-analytics-actions';
import {updateIgnoreQueryTrigger} from '../../features/triggers/triggers-actions';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice';
import {TriggerSection, QuerySection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController} from '../controller/headless-controller';
import {QueryTrigger} from '../core/triggers/headless-core-query-trigger';

/**
 * Creates a `QueryTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `QueryTrigger` controller instance.
 * */
export function buildQueryTrigger(engine: SearchEngine): QueryTrigger {
  if (!loadQueryTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state;

  const modification = () => getState().triggers.queryModification.newQuery;
  const originalQuery = () =>
    getState().triggers.queryModification.originalQuery;

  return {
    ...controller,

    get state() {
      return {
        newQuery: modification(),
        originalQuery: originalQuery(),
        wasQueryModified: modification() !== '',
      };
    },

    undo() {
      dispatch(updateIgnoreQueryTrigger(modification()));
      dispatch(updateQuery({q: originalQuery()}));
      dispatch(
        executeSearch({
          legacy: logUndoTriggerQuery({
            undoneQuery: modification(),
          }),
          next: undoTriggerQuery(),
        })
      );
    },
  };
}

function loadQueryTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection & QuerySection> {
  engine.addReducers({triggers, query});
  return true;
}
