import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client.js';
import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {
  type FetchClassificationsThunkReturn,
  fetchCaseClassifications,
  registerCaseField,
  type SetCaseFieldActionCreatorPayload,
  type StateNeededByFetchClassifications,
  updateCaseField,
} from './case-field-actions.js';

export type {SetCaseFieldActionCreatorPayload};

/**
 * The case field action creators.
 *
 * @group Actions
 * @category CaseField
 */
export interface CaseFieldActionCreators {
  /**
   * Registers a case field with the specified field and value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerCaseField(
    payload: SetCaseFieldActionCreatorPayload
  ): PayloadAction<SetCaseFieldActionCreatorPayload>;

  /**
   * Updates the specified case field with the provided value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCaseField(
    payload: SetCaseFieldActionCreatorPayload
  ): PayloadAction<SetCaseFieldActionCreatorPayload>;

  /**
   * Retrieves the case classifications from the platform.
   * A single call retrieves classifications for all fields specified in the Case Assist configuration.
   * Case classifications are retrieved based on the case information entered so far.
   *
   * @returns A dispatchable action.
   */
  fetchCaseClassifications(): AsyncThunkAction<
    FetchClassificationsThunkReturn,
    void,
    AsyncThunkCaseAssistOptions<StateNeededByFetchClassifications>
  >;
}

/**
 * Loads the `case fields` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category CaseField
 */
export function loadCaseFieldActions(
  engine: CaseAssistEngine
): CaseFieldActionCreators {
  engine.addReducers({caseField});

  return {
    registerCaseField,
    updateCaseField,
    fetchCaseClassifications,
  };
}
