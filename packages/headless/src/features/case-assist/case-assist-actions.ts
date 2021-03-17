import {createAsyncThunk} from '@reduxjs/toolkit';
import {ServiceAPIClient} from '../../api/service/service-api-client';

export interface GetClassificationsRequest {
  fields: {[field: string]: string};
  context?: {[key: string]: any};
}

export interface GetClassificationsFieldResponse {
  name: string;
  predictions: {
    // id: string;
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

export const getClassifications = createAsyncThunk(
  'caseAssist/getClassifications',
  async (
    request: GetClassificationsRequest,
    {getState, extra: {serviceAPIClient}}: any
  ) => {
    const state = getState();

    const response = await (serviceAPIClient as ServiceAPIClient).classify({
      url: state.configuration.platformUrl,
      accessToken: state.configuration.accessToken,
      organizationId: state.configuration.organizationId,
      locale: state.configuration.search.locale,
      caseAssistId: state.configuration.caseAssist.caseAssistId,
      visitorId: state.configuration.caseAssist.visitorId,
      ...request,
    });

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
