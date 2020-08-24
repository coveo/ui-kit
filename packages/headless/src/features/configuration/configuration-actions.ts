import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue, BooleanValue} from '@coveo/bueno';

const originSchemaOnConfigUpdate = () =>
  new StringValue({emptyAllowed: false, required: false});

const originSchemaOnUpdate = () =>
  new StringValue({emptyAllowed: false, required: true});

/**
 * Update the global headless engine configuration.
 * @param accessToken The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
 * @param organizationId The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
 * @param platformUrl The Plaform URL to use (e.g., https://platform.cloud.coveo.com).
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
 * Update the analytics configuration.
 * @param enabled Specifies if usage analytics tracking should be enabled.
 * @param originLevel2 Specifies the origin level 2 usage analytics event metadata whose value should typically be the name/identifier of the tab from which the usage analytics event originates.
 * @param originLevel3 Specifies the origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request.
 * @param apiBaseUrl The Usage Analytics API base URL to use (e.g., https://platform.cloud.coveo.com/rest/ua).
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

/**
 * Set originLevel2 for analytics tracking
 */
export const setOriginLevel2 = createAction(
  'configuration/analytics/originlevel2',
  (payload: {originLevel2: string}) =>
    validatePayloadSchema(payload, {originLevel2: originSchemaOnUpdate()})
);

/**
 * Set originLevel3 for analytics tracking
 */
export const setOriginLevel3 = createAction(
  'configuration/analytics/originlevel3',
  (payload: {originLevel3: string}) =>
    validatePayloadSchema(payload, {originLevel3: originSchemaOnUpdate()})
);
