import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/analytics';
import {isErrorResponse} from '../../api/search/search-api-client';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {GetCaseClassificationsRequest} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-request';
import {GetCaseClassificationsResponse} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-response';
import {
  CaseAssistConfigurationSection,
  CaseFieldsSection,
  ConfigurationSection,
  DebugSection,
} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

export interface SetCaseFieldActionCreatorPayload {
  /**
   * The name of the field whose value is being updated (e.g., product, category, model)
   */
  fieldName: string;
  /**
   * The value to set in the state.
   */
  fieldValue: string;
}

/**
 * Adds or updates the state caseFields with the specified field and value.
 */
export const setCaseField = createAction(
  'caseAssist/caseField/set',
  (payload: SetCaseFieldActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredNonEmptyString,
    })
);

export const enableCaseClassifications = createAction(
  'caseAssist/classifications/enable'
);

export const disableCaseClassifications = createAction(
  'caseAssist/classifications/disable'
);

export interface FetchClassificationsThunkReturn {
  /** The successful classifications response. */
  response: GetCaseClassificationsResponse;
}

export type StateNeededByFetchClassifications = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseFieldsSection &
  DebugSection;

export const fetchCaseClassifications = createAsyncThunk<
  FetchClassificationsThunkReturn,
  void,
  AsyncThunkCaseAssistOptions<StateNeededByFetchClassifications>
>(
  'caseAssist/classifications/fetch',
  async (_, {getState, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;

    const fetched = await apiClient.getCaseClassifications(
      buildFetchClassificationRequest(state)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export const buildFetchClassificationRequest = (
  state: StateNeededByFetchClassifications
): GetCaseClassificationsRequest => ({
  caseAssistId: state.caseAssistConfiguration.caseAssistId,
  visitorId: getVisitorID(),
  locale: state.caseAssistConfiguration.locale,
  url: state.configuration.platformUrl,
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  debug: state.debug,
  fields: state.caseFields.fields,
});
