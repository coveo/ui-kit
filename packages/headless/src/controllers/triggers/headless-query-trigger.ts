import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {updateQuery} from '../../features/query/query-actions.js';
import {queryReducer as query} from '../../features/query/query-slice.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {logUndoTriggerQuery} from '../../features/triggers/trigger-analytics-actions.js';
import {updateIgnoreQueryTrigger} from '../../features/triggers/triggers-actions.js';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice.js';
import type {QuerySection, TriggerSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {buildController} from '../controller/headless-controller.js';
import type {QueryTrigger} from '../core/triggers/headless-core-query-trigger.js';

/**
 * Creates a `QueryTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `QueryTrigger` controller instance.
 *
 * @group Controllers
 * @category QueryTrigger
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
