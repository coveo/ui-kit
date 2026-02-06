import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as query} from '../../../features/commerce/query/query-slice.js';
import {executeSearch} from '../../../features/commerce/search/search-actions.js';
import {updateIgnoreQueryTrigger} from '../../../features/commerce/triggers/triggers-actions.js';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice.js';
import type {TriggerSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {buildController} from '../../controller/headless-controller.js';
import type {QueryTrigger} from '../../core/triggers/headless-core-query-trigger.js';

/**
 * Options for configuring the `QueryTrigger` controller.
 * @group Buildable controllers
 * @category QueryTrigger
 */
export interface QueryTriggerOptions {
  /**
   * When set to true, fills the `results` field rather than the `products` field
   * in the response. It may also include Spotlight Content in the results.
   * @default false
   */
  enableResults?: boolean;
}

/**
 * Creates a `QueryTrigger` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param options - The configurable `QueryTrigger` controller options.
 * @returns A `QueryTrigger` controller instance.
 *
 * @group Buildable controllers
 * @category QueryTrigger
 * */
export function buildQueryTrigger(
  engine: CommerceEngine,
  {enableResults = false}: QueryTriggerOptions = {enableResults: false}
): QueryTrigger {
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
      dispatch(executeSearch({enableResults}));
    },
  };
}

function loadQueryTriggerReducers(
  engine: CommerceEngine
): engine is CommerceEngine<TriggerSection> {
  engine.addReducers({triggers, query});
  return true;
}
