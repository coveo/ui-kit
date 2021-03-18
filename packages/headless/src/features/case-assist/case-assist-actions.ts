import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/analytics';
import {Result} from '../../api/search/search/result';
import {
  ServiceAPIResponse,
  ServiceAPIErrorResponse,
  ClassifySuccessContent,
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
  classifications: {
    fields: GetClassificationsFieldResponse[];
    responseId: string;
  };
}

export interface GetDocumentSuggestionsResponse {
  documents: Result[];
  totalCount: number;
  responseId: string;
}

export interface AsyncThunkOptions {
  state: CaseAssistAppState;
  rejectValue: ServiceAPIErrorResponse;
  extra: ThunkExtraArguments;
}

export interface SetCaseAssistIdPayload {
  id: string;
}

export const setCaseAssistId = createAction(
  'caseAssist/setCaseAssistId',
  (payload: SetCaseAssistIdPayload) =>
    validatePayload(payload, {
      id: new StringValue({required: true, emptyAllowed: false}),
    })
);

export interface SetCaseInformationValuePayload {
  fieldName: string;
  fieldValue: string;
}

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

export const setUserContextValue = createAction(
  'caseAssist/setUserContextValue',
  (payload: SetUserContextValuePayload) =>
    validatePayload(payload, {
      key: new StringValue({required: true, emptyAllowed: false}),
      value: new StringValue({required: true, emptyAllowed: true}),
    })
);

const buildGetClassificationsRequest = (
  s: CaseAssistAppState
): ClassifyParam => ({
  url: s.configuration.platformUrl,
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  locale: s.configuration.search.locale,
  caseAssistId: s.caseAssist.caseAssistId,
  visitorId: getVisitorID() || 'foo',
  fields: s.caseAssist.caseInformation,
});

const buildGetDocumentSuggestionsRequest = (
  s: CaseAssistAppState
): SuggestDocumentsParam => ({
  url: s.configuration.platformUrl,
  accessToken: s.configuration.accessToken,
  organizationId: s.configuration.organizationId,
  locale: s.configuration.search.locale,
  caseAssistId: s.caseAssist.caseAssistId,
  visitorId: getVisitorID() || 'foo',
  fields: s.caseAssist.caseInformation,
  context: s.caseAssist.userContext,
});

export const getClassifications = createAsyncThunk<
  GetClassificationsResponse,
  void,
  AsyncThunkOptions
>(
  'caseAssist/getClassifications',
  async (_, {getState, rejectWithValue, extra: {serviceAPIClient}}) => {
    const state = getState();
    const response = await serviceAPIClient.classify(
      buildGetClassificationsRequest(state)
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
    classifications: {
      fields: fields,
      responseId: response.responseId,
    },
  };
};

export const getDocumentSuggestions = createAsyncThunk<
  GetDocumentSuggestionsResponse,
  void,
  AsyncThunkOptions
>(
  'caseAssist/getDocumentSuggestions',
  async (_, {getState, rejectWithValue, extra: {serviceAPIClient}}) => {
    const state = getState();
    const response = await serviceAPIClient.suggestDocuments(
      buildGetDocumentSuggestionsRequest(state)
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
