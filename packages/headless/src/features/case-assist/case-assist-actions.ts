import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/analytics';
import {
  ServiceAPIResponse,
  ServiceAPIErrorResponse,
} from '../../api/service/service-api-client';
import {ClassifyParam} from '../../api/service/service-api-params';
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

    return parseGetClassificationsResponse(response);
  }
);

const parseGetClassificationsResponse = (response: any) => {
  const fields: GetClassificationsFieldResponse[] = [];

  Object.keys(response.success.fields).forEach((fieldName) => {
    fields.push({
      name: fieldName,
      predictions: response.success.fields[fieldName].predictions,
    });
  });

  return {
    classifications: {
      fields: fields,
      responseId: response.success.responseId,
    },
  };
};

const isErrorResponse = (
  response: ServiceAPIResponse<any>
): response is ServiceAPIErrorResponse => {
  return (response as ServiceAPIErrorResponse).error !== undefined;
};
