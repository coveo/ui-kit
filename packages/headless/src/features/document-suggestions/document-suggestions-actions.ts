import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/analytics';
import {isErrorResponse} from '../../api/search/search-api-client';
import {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client';
import {GetCaseClassificationsRequest} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-request';
import {GetCaseClassificationsResponse} from '../../api/service/case-assist/get-case-classifications/get-case-classifications-response';
import {GetDocumentSuggestionsResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response';
import {
  CaseAssistConfigurationSection,
  DocumentSuggestionsSection,
  ConfigurationSection,
  DebugSection,
} from '../../state/state-sections';

export const enableCaseClassifications = createAction(
  'caseAssist/classifications/enable'
);

export const disableCaseClassifications = createAction(
  'caseAssist/classifications/disable'
);

export interface FetchDocumentSuggestionsThunkReturn {
  /** The successful classifications response. */
  response: GetDocumentSuggestionsResponse;
}

export type StateNeededByFetchClassifications = ConfigurationSection &
  CaseAssistConfigurationSection &
  DocumentSuggestionsSection &
  DebugSection;

export const fetchDocumentSuggestions = createAsyncThunk<
  FetchDocumentSuggestionsThunkReturn,
  void,
  AsyncThunkCaseAssistOptions<StateNeededByFetchClassifications>
>(
  'caseAssist/classifications/fetch',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();

    const fetched = await apiClient(
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
  state: StateNeededByFetchClassifications
): Promise<GetCaseClassificationsRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: state.configuration.platformUrl,
  caseAssistId: state.caseAssistConfiguration.caseAssistId,
  ...(state.configuration.analytics.enabled && {
    visitorId: await getVisitorID(),
  }),
  fields: state.DocumentSuggestions.fields,
  locale: state.caseAssistConfiguration.locale,
  debug: state.debug,
});
