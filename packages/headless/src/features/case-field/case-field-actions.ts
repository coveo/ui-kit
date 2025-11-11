import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import {isErrorResponse} from '../../api/search/search-api-client.js';
import type {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client.js';
import {prepareContextFromFields} from '../../api/service/case-assist/case-assist-params.js';
import type {GetCaseClassificationsRequest} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-request.js';
import type {GetCaseClassificationsResponse} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-response.js';
import type {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
} from '../../state/state-sections.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';

export interface SetCaseFieldActionCreatorPayload {
  /**
   * The name of the field whose value is being updated (for example, product, category, model)
   */
  fieldName: string;
  /**
   * The value to set in the state.
   */
  fieldValue: string;
}

export const registerCaseField = createAction(
  'caseAssist/caseField/register',
  (payload: SetCaseFieldActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredEmptyAllowedString,
    })
);

export const updateCaseField = createAction(
  'caseAssist/caseField/update',
  (payload: SetCaseFieldActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredEmptyAllowedString,
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
const buildFetchClassificationRequest = async (
  state: StateNeededByFetchClassifications
): Promise<GetCaseClassificationsRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url:
    state.caseAssistConfiguration.apiBaseUrl ??
    getOrganizationEndpoint(
      state.configuration.organizationId,
      state.configuration.environment
    ),
  caseAssistId: state.caseAssistConfiguration.caseAssistId,
  ...(state.configuration.analytics.enabled && {
    clientId: await getVisitorID(state.configuration.analytics),
  }),
  fields: state.caseInput,
  context: state.caseField
    ? prepareContextFromFields(state.caseField.fields)
    : undefined,
  locale: state.caseAssistConfiguration.locale,
  debug: state.debug,
});
