import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {ApplyQueryTriggerModificationPayload} from '../../triggers/triggers-actions.js';
import {
  UpdateIgnoreQueryTriggerPayload,
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions.js';
import {commerceTriggersReducer as triggers} from './triggers-slice.js';

export type {
  UpdateIgnoreQueryTriggerPayload,
  ApplyQueryTriggerModificationPayload,
  updateIgnoreQueryTrigger,
};

/**
 * The triggers action creators.
 */
export interface TriggersActionCreators {
  /**
   * Updates the query to ignore the query trigger.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   * */
  updateIgnoreQueryTrigger(
    payload: UpdateIgnoreQueryTriggerPayload
  ): PayloadAction<UpdateIgnoreQueryTriggerPayload>;

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
