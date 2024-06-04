import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {updateQuery} from '../../../features/commerce/query/query-actions';
import {queryReducer as query} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {updateIgnoreQueryTrigger} from '../../../features/commerce/triggers/triggers-actions';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice';
import {TriggerSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {buildController} from '../../controller/headless-controller';
import {QueryTrigger} from '../../core/triggers/headless-core-query-trigger';

/**
 * Creates a `QueryTrigger` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `QueryTrigger` controller instance.
 * */
export function buildQueryTrigger(engine: CommerceEngine): QueryTrigger {
  if (!loadQueryTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine[stateKey];

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
      dispatch(updateIgnoreQueryTrigger({q: modification()}));
      dispatch(updateQuery({query: originalQuery()}));
      dispatch(executeSearch());
    },
  };
}

function loadQueryTriggerReducers(
  engine: CommerceEngine
): engine is CommerceEngine<TriggerSection> {
  engine.addReducers({triggers, query});
  return true;
}
