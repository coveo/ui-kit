import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {caseFields} from '../../app/reducers';
import {
  disableCaseClassifications,
  enableCaseClassifications,
  fetchCaseClassifications,
  FetchClassificationsThunkReturn,
  setCaseField,
  SetCaseFieldActionCreatorPayload,
  StateNeededByFetchClassifications,
} from './document-suggestions-actions';

export {SetCaseFieldActionCreatorPayload};

/**
 * The case fields action creators.
 */
export interface CaseAssistActionCreators {
  /**
   * Adds or updates the state caseFields with the specified field and value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setCaseField(
    payload: SetCaseFieldActionCreatorPayload
  ): PayloadAction<SetCaseFieldActionCreatorPayload>;

  /**
   * Enables case classifications to be updated when case information changes.
   *
   * @returns A dispatchable action.
   */
  enableCaseClassifications(): PayloadAction;

  /**
   * Disables case classifications from being updated when case information changes.
   *
   * @returns A dispatchable action.
   */
  disableCaseClassifications(): PayloadAction;

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
 * Loads the `case assist` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadCaseFieldsActions(
  engine: CaseAssistEngine
): CaseAssistActionCreators {
  engine.addReducers({caseFields});

  return {
    setCaseField,
    enableCaseClassifications,
    disableCaseClassifications,
    fetchCaseClassifications,
  };
}
