import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Update the global headless engine configuration.
 * @param accessToken The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
 * @param organizationId The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
 * @param platformUrl The Plaform URL to use (e.g., https://platform.cloud.coveo.com).
 */
export const updateBasicConfiguration = createAction(
  'configuration/updateBasicConfiguration',
  (payload: {
    accessToken: string;
    organizationId: string;
    platformUrl?: string;
  }) =>
    validatePayloadSchema(payload, {
      accessToken: new StringValue({required: true, emptyAllowed: false}),
      organizationId: new StringValue({required: true, emptyAllowed: false}),
      platformUrl: new StringValue({url: true, emptyAllowed: false}),
    })
);

/**
 * Update the search configuration.
 * @param apiBaseUrl The Search API base URL to use (e.g., https://platform.cloud.coveo.com/rest/search/v2).
 * @param pipeline Specifies the name of the query pipeline to use for the query. If not specified, the default query pipeline will be used.
 * @param searchHub The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
 */
export const updateSearchConfiguration = createAction(
  'configuration/updateSearchConfiguration',
  (payload: {apiBaseUrl?: string; pipeline: string; searchHub: string}) =>
    validatePayloadSchema(payload, {
      apiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
      pipeline: new StringValue({default: 'default'}),
      searchHub: new StringValue({default: 'default'}),
    })
);

/**
 * Renew the accessToken specified in the global headless engine configuration.
 * @param renew A function that fetches a new access token. The function must return a Promise that resolves to a string (the new access token).
 */
export const renewAccessToken = createAsyncThunk(
  'configuration/renewAccessToken',
  async (renew: () => Promise<string>) => {
    return await renew();
  }
);

/**
 * Update the analytics configuration.
 * @param apiBaseUrl The Usage Analytics API base URL to use (e.g., https://platform.cloud.coveo.com/rest/ua).
 */
export const updateAnalyticsConfiguration = createAction(
  'configuration/updateAnalyticsConfiguration',
  (payload: {apiBaseUrl?: string}) =>
    validatePayloadSchema(payload, {
      apiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
    })
);

/**
 * Disable analytics tracking
 */
export const disableAnalytics = createAction('configuration/analytics/disable');
/**
 * Enable analytics tracking
 */
export const enableAnalytics = createAction('configuration/analytics/enable');
