import {createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/analytics';
import {isErrorResponse} from '../../api/search/search-api-client';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {GetDocumentSuggestionsRequest} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-request';
import {GetDocumentSuggestionsResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response';
import {
  CaseAssistConfigurationSection,
  DocumentSuggestionSection,
  ConfigurationSection,
  DebugSection,
  CaseInputsSection,
} from '../../state/state-sections';

export interface FetchDocumentSuggestionsThunkReturn {
  /** The successful document suggestions response. */
  response: GetDocumentSuggestionsResponse;
}

export type StateNeededByFetchDocumentSuggestions = ConfigurationSection &
  CaseAssistConfigurationSection &
  DocumentSuggestionSection &
  CaseInputsSection &
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
  url: state.configuration.platformUrl,
  caseAssistId: state.caseAssistConfiguration.caseAssistId,
  ...(state.configuration.analytics.enabled && {
    visitorId: await getVisitorID(),
  }),
  fields: state.caseInputs,
  locale: state.caseAssistConfiguration.locale,
  debug: state.debug,
});
