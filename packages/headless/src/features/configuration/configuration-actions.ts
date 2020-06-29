import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Update the global headless engine configuration.
 * @param accessToken The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
 * @param organizationId The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
 */
export const updateBasicConfiguration = createAction(
  'configuration/updateBasicConfiguration',
  (payload: {accessToken: string; organizationId: string}) =>
    validatePayloadSchema(payload, {
      accessToken: new StringValue({required: true, emptyAllowed: false}),
      organizationId: new StringValue({required: true, emptyAllowed: false}),
    })
);

/**
 * Update the search configuration.
 * @param searchApiBaseUrl The Search API base URL to use (e.g., https://globalplatform.cloud.coveo.com/rest/search/v2).
 */
export const updateSearchConfiguration = createAction(
  'configuration/updateSearchConfiguration',
  (payload: {searchApiBaseUrl?: string}) =>
    validatePayloadSchema(payload, {
      searchApiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
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
 * Disable analytics tracking
 */
export const disableAnalytics = createAction('configuration/analytics/disable');
/**
 * Enable analytics tracking
 */
export const enableAnalytics = createAction('configuration/analytics/enable');
