import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {caseField} from '../../app/reducers';
import {
  fetchCaseClassifications,
  FetchClassificationsThunkReturn,
  updateCaseField,
  SetCaseFieldActionCreatorPayload,
  StateNeededByFetchClassifications,
  registerCaseField,
} from './case-field-actions';

export type {SetCaseFieldActionCreatorPayload};

/**
 * The case field action creators.
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
