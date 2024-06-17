import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../query-set/query-set-actions';
import {QuerySetActionCreators} from '../../query-set/query-set-actions-loader';
import {querySetReducer as querySet} from '../../query-set/query-set-slice';

/**
 * Loads the `querySet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadQuerySetActions(
  engine: CommerceEngine
): QuerySetActionCreators {
  engine.addReducers({querySet});

  return {
    registerQuerySetQuery,
    updateQuerySetQuery,
  };
}
