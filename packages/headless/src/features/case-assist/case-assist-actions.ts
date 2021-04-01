import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {CoveoAnalyticsClient} from 'coveo.analytics';
import {ExecutionReport} from '../../api/search/search/execution-report';
import {
  ServiceAPIResponse,
  ServiceAPIErrorResponse,
  ClassifySuccessContent,
  Result,
} from '../../api/service/service-api-client';
import {
  ClassifyParam,
  SuggestDocumentsParam,
} from '../../api/service/service-api-params';
import {ThunkExtraArguments} from '../../app/store';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {validatePayload} from '../../utils/validate-payload';

export interface GetClassificationsFieldResponse {
  name: string;
  predictions: {
    id: string;
    value: string;
    confidence: number;
  }[];
}

export interface GetClassificationsResponse {
  fields: GetClassificationsFieldResponse[];
  responseId: string;
  executionReport?: ExecutionReport;
}

export interface GetDocumentSuggestionsResponse {
  documents: Result[];
  totalCount: number;
  responseId: string;
  executionReport?: ExecutionReport;
}

export interface AsyncThunkOptions {
  state: CaseAssistAppState;
  rejectValue: ServiceAPIErrorResponse;
  extra: ThunkExtraArguments;
}

export interface SetCaseInformationValuePayload {
  fieldName: string;
  fieldValue: string;
}

/**
 * Sets the provided value in the case information.
 */
export const setCaseInformationValue = createAction(
  'caseAssist/setCaseInformationValue',
  (payload: SetCaseInformationValuePayload) =>
    validatePayload(payload, {
      fieldName: new StringValue({required: true, emptyAllowed: false}),
      fieldValue: new StringValue({required: true, emptyAllowed: true}),
    })
);

export interface SetUserContextValuePayload {
  key: string;
  value: string;
}

/**
 * Sets the provided value in the user context.
 */
export const setUserContextValue = createAction(
  'caseAssist/setUserContextValue',
  (payload: SetUserContextValuePayload) =>
    validatePayload(payload, {
      key: new StringValue({required: true, emptyAllowed: false}),
      value: new StringValue({required: true, emptyAllowed: true}),
    })
);

export interface SetDebugPayload {
  debug: boolean;
}

/**
 * Sets whether debug information should be retrieved with suggestions.
 */
export const setDebug = createAction(
  'caseAssist/setDebug',
  (payload: SetDebugPayload) =>
    validatePayload(payload, {
      debug: new BooleanValue({required: true, default: false}),
    })
);

const buildGetClassificationsRequest = async (
  s: CaseAssistAppState
): Promise<ClassifyParam> => ({
  url: s.configuration.platformUrl,
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  locale: s.configuration.search.locale,
  caseAssistId: s.configuration.caseAssist.caseAssistId,
  visitorId: await getVisitorId(),
  fields: s.caseAssist.caseInformation,
  debug: s.caseAssist.debug,
});

const buildGetDocumentSuggestionsRequest = async (
  s: CaseAssistAppState
): Promise<SuggestDocumentsParam> => ({
  url: s.configuration.platformUrl,
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  locale: s.configuration.search.locale,
  caseAssistId: s.configuration.caseAssist.caseAssistId,
  visitorId: await getVisitorId(),
  fields: s.caseAssist.caseInformation,
  context: s.caseAssist.userContext,
  debug: s.caseAssist.debug,
});

/**
 * Retrieves the case classifications given the current case information.
 */
export const getClassifications = createAsyncThunk<
  GetClassificationsResponse,
  void,
  AsyncThunkOptions
>(
  'caseAssist/getClassifications',
  async (_, {getState, rejectWithValue, extra: {serviceAPIClient}}) => {
    const state = getState();
    const response = await serviceAPIClient.caseAssist.classify(
      await buildGetClassificationsRequest(state)
    );

    if (isErrorResponse(response)) {
      return rejectWithValue(response);
    }

    return parseGetClassificationsResponse(response.success);
  }
);

const parseGetClassificationsResponse = (response: ClassifySuccessContent) => {
  const fields: GetClassificationsFieldResponse[] = [];

  Object.keys(response.fields).forEach((fieldName) => {
    fields.push({
      name: fieldName,
      predictions: response.fields[fieldName].predictions,
    });
  });

  return {
    fields: fields,
    responseId: response.responseId,
  };
};

/**
 * Retrieves the document suggestions given the current case information
 * and user context.
 */
export const getDocumentSuggestions = createAsyncThunk<
  GetDocumentSuggestionsResponse,
  void,
  AsyncThunkOptions
>(
  'caseAssist/getDocumentSuggestions',
  async (_, {getState, rejectWithValue, extra: {serviceAPIClient}}) => {
    const state = getState();
    const response = await serviceAPIClient.caseAssist.suggestDocuments(
      await buildGetDocumentSuggestionsRequest(state)
    );

    if (isErrorResponse(response)) {
      return rejectWithValue(response);
    }

    return response.success;
  }
);

const isErrorResponse = (
  response: ServiceAPIResponse<any>
): response is ServiceAPIErrorResponse => {
  return (response as ServiceAPIErrorResponse).error !== undefined;
};

const getVisitorId = async () => {
  const client = new CoveoAnalyticsClient({});
  return await client.getCurrentVisitorId();
};
