import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ApplyQueryTriggerModificationPayload} from '../../triggers/triggers-actions';
import {
  UpdateIgnoreQueryTriggerActionCreator,
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions';
import {commerceTriggersReducer as triggers} from './triggers-slice';

export type {
  UpdateIgnoreQueryTriggerActionCreator,
  ApplyQueryTriggerModificationPayload,
};

/**
 * The triggers action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface TriggersActionCreators {
  /**
   * Updates the query to ignore the query trigger.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   * */
  updateIgnoreQueryTrigger(
    payload: UpdateIgnoreQueryTriggerActionCreator
  ): PayloadAction<UpdateIgnoreQueryTriggerActionCreator>;

  /**
   * Applies a query trigger modification.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   * */
  applyQueryTriggerModification(
    payload: ApplyQueryTriggerModificationPayload
  ): PayloadAction<ApplyQueryTriggerModificationPayload>;
}

/**
 * Loads the commerce triggers reducer and returns the available triggers action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the triggers actions.
 */
export function loadTriggersActions(engine: CommerceEngine) {
  engine.addReducers({triggers});
  return {
    updateIgnoreQueryTrigger,
    applyQueryTriggerModification,
  };
}
