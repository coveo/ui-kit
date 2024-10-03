import {createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import {isErrorResponse} from '../../api/search/search-api-client.js';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client.js';
import {prepareContextFromFields} from '../../api/service/case-assist/case-assist-params.js';
import {GetDocumentSuggestionsRequest} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-request.js';
import {GetDocumentSuggestionsResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';
import {
  CaseAssistConfigurationSection,
  DocumentSuggestionSection,
  ConfigurationSection,
  DebugSection,
  CaseInputSection,
  CaseFieldSection,
} from '../../state/state-sections.js';

export interface FetchDocumentSuggestionsThunkReturn {
  /** The successful document suggestions response. */
  response: GetDocumentSuggestionsResponse;
}

export type StateNeededByFetchDocumentSuggestions = ConfigurationSection &
  CaseAssistConfigurationSection &
  DocumentSuggestionSection &
  CaseInputSection &
  CaseFieldSection &
  DebugSection;

export const fetchDocumentSuggestions = createAsyncThunk<
  FetchDocumentSuggestionsThunkReturn,
  void,
  AsyncThunkCaseAssistOptions<StateNeededByFetchDocumentSuggestions>
>(
  'caseAssist/documentSuggestions/fetch',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();

    const fetched = await apiClient.getDocumentSuggestions(
      await buildFetchDocumentSuggestionsRequest(state)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export const buildFetchDocumentSuggestionsRequest = async (
  state: StateNeededByFetchDocumentSuggestions
): Promise<GetDocumentSuggestionsRequest> => ({
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
