import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
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
export function buildQueryTrigger(
  engine: SearchEngine | FrankensteinEngine
): QueryTrigger {
  const searchEngine = ensureSearchEngine(engine);
  if (!loadQueryTriggerReducers(searchEngine)) {
    throw loadReducerError;
  }

  const controller = buildController(searchEngine);
  const {dispatch} = searchEngine;

  const getState = () => searchEngine.state;

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
