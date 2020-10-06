import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue, BooleanValue} from '@coveo/bueno';

const originSchemaOnConfigUpdate = () =>
  new StringValue({emptyAllowed: false, required: false});

const originSchemaOnUpdate = () =>
  new StringValue({emptyAllowed: false, required: true});

/**
 * Updates the global headless engine configuration.
 * @param accessToken (string) The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
 * @param organizationId (string) The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
 * @param platformUrl (string) The Plaform URL to use (e.g., `https://platform.cloud.coveo.com`).
 */
export const updateBasicConfiguration = createAction(
  'configuration/updateBasicConfiguration',
  (payload: {
    accessToken?: string;
    organizationId?: string;
    platformUrl?: string;
  }) =>
    validatePayloadSchema(payload, {
      accessToken: new StringValue({emptyAllowed: false}),
      organizationId: new StringValue({emptyAllowed: false}),
      platformUrl: new StringValue({url: true, emptyAllowed: false}),
    })
);

/**
 * Updates the search configuration.
 * @param apiBaseUrl (string) The Search API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/search/v2`).
 * @param pipeline (string) The name of the query pipeline to use for the query (e.g., `External Search`). If not specified, the default query pipeline will be used.
 * @param searchHub (string) The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates (e.g., `ExternalSearch`).
 */
export const updateSearchConfiguration = createAction(
  'configuration/updateSearchConfiguration',
  (payload: {apiBaseUrl?: string; pipeline?: string; searchHub?: string}) =>
    validatePayloadSchema(payload, {
      apiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
      pipeline: new StringValue({emptyAllowed: false}),
      searchHub: new StringValue({emptyAllowed: false}),
    })
);

/**
 * Updates the analytics configuration.
 * @param enabled (boolean) Whether to enable usage analytics tracking.
 * @param originLevel2 (string) The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab from which the usage analytics event originates (e.g., `All`).
 * @param originLevel3 (string) The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request (e.g., `https://connect.coveo.com/s/`).
 * @param apiBaseUrl (string) The Usage Analytics API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/ua`).
 */
export const updateAnalyticsConfiguration = createAction(
  'configuration/updateAnalyticsConfiguration',
  (payload: {
    enabled?: boolean;
    originLevel2?: string;
    originLevel3?: string;
    apiBaseUrl?: string;
  }) =>
    validatePayloadSchema(payload, {
      enabled: new BooleanValue({default: true}),
      originLevel2: originSchemaOnConfigUpdate(),
      originLevel3: originSchemaOnConfigUpdate(),
      apiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
    })
);

/**
 * Renews the accessToken specified in the global headless engine configuration.
 * @param renew (`() => Promise<string>`) A function that fetches a new access token. The function must return a Promise that resolves to a string (the new access token).
 */
export const renewAccessToken = createAsyncThunk(
  'configuration/renewAccessToken',
  async (renew: () => Promise<string>) => {
    return await renew();
  }
);

/**
 * Disables analytics tracking.
 */
export const disableAnalytics = createAction('configuration/analytics/disable');
/**
 * Enables analytics tracking.
 */
export const enableAnalytics = createAction('configuration/analytics/enable');

/**
 * Sets originLevel2 for analytics tracking.
 * @param originLevel2 (string) The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab (e.g., `All`).
 */
export const setOriginLevel2 = createAction(
  'configuration/analytics/originlevel2',
  (payload: {originLevel2: string}) =>
    validatePayloadSchema(payload, {originLevel2: originSchemaOnUpdate()})
);

/**
 * Sets originLevel3 for analytics tracking.
 * @param originLevel3 (string) The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface (e.g., `https://connect.coveo.com/s/`).
 */
export const setOriginLevel3 = createAction(
  'configuration/analytics/originlevel3',
  (payload: {originLevel3: string}) =>
    validatePayloadSchema(payload, {originLevel3: originSchemaOnUpdate()})
);
