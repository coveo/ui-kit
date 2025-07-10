import {createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import {isErrorResponse} from '../../api/search/search-api-client.js';
import type {AsyncThunkCaseAssistOptions} from '../../api/service/case-assist/case-assist-api-client.js';
import {prepareContextFromFields} from '../../api/service/case-assist/case-assist-params.js';
import type {GetDocumentSuggestionsRequest} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-request.js';
import type {GetDocumentSuggestionsResponse} from '../../api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
  DocumentSuggestionSection,
} from '../../state/state-sections.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params.js';

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
  async (
    _,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const state = getState();

    const fetched = await apiClient.getDocumentSuggestions(
      await buildFetchDocumentSuggestionsRequest(state, navigatorContext)
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
  state: StateNeededByFetchDocumentSuggestions,
  navigatorContext: NavigatorContext
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
  ...(state.configuration.analytics.enabled &&
    fromAnalyticsStateToAnalyticsParams(
      state.configuration.analytics,
      navigatorContext,
      {
        actionCause: SearchPageEvents.documentSuggestion,
      }
    )),
  fields: state.caseInput,
  context: state.caseField
    ? prepareContextFromFields(state.caseField.fields)
    : undefined,
  locale: state.caseAssistConfiguration.locale,
  debug: state.debug,
});
