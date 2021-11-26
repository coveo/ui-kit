import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/analytics';
import {isErrorResponse} from '../../api/search/search-api-client';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {GetCaseClassificationsRequest} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-request';
import {GetCaseClassificationsResponse} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-response';
import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
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
 * Registers a case field with the specified field and value.
 */
export const registerCaseField = createAction(
  'caseAssist/caseField/register',
  (payload: SetCaseFieldActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredNonEmptyString,
    })
);

/**
 * Updates the specified case field with the provided value.
 */
export const updateCaseField = createAction(
  'caseAssist/caseField/update',
  (payload: SetCaseFieldActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredNonEmptyString,
    })
);

export interface FetchClassificationsThunkReturn {
  /** The successful classifications response. */
  response: GetCaseClassificationsResponse;
}

export type StateNeededByFetchClassifications = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseFieldSection &
  CaseInputSection &
  DebugSection;

export const fetchCaseClassifications = createAsyncThunk<
  FetchClassificationsThunkReturn,
  void,
  AsyncThunkCaseAssistOptions<StateNeededByFetchClassifications>
>(
  'caseAssist/classifications/fetch',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();

    const fetched = await apiClient.getCaseClassifications(
      await buildFetchClassificationRequest(state)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export const buildFetchClassificationRequest = async (
  state: StateNeededByFetchClassifications
): Promise<GetCaseClassificationsRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: state.configuration.platformUrl,
  caseAssistId: state.caseAssistConfiguration.caseAssistId,
  ...(state.configuration.analytics.enabled && {
    visitorId: await getVisitorID(),
  }),
  fields: state.caseInput,
  locale: state.caseAssistConfiguration.locale,
  debug: state.debug,
});
