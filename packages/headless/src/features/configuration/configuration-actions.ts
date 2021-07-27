import {createAction} from '@reduxjs/toolkit';
import {
  nonEmptyString,
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {StringValue, BooleanValue, Value} from '@coveo/bueno';
import {IRuntimeEnvironment} from 'coveo.analytics';

const originSchemaOnConfigUpdate = () => nonEmptyString;

const originSchemaOnUpdate = () => requiredNonEmptyString;

export interface UpdateBasicConfigurationActionCreatorPayload {
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken?: string;

  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId?: string;

  /**
   * The Plaform URL to use (e.g., `https://platform.cloud.coveo.com`).
   */
  platformUrl?: string;
}

/**
 * Updates the global headless engine configuration.
 * @param accessToken (string) The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
 * @param organizationId (string) The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
 * @param platformUrl (string) The Plaform URL to use (e.g., `https://platform.cloud.coveo.com`).
 */
export const updateBasicConfiguration = createAction(
  'configuration/updateBasicConfiguration',
  (payload: UpdateBasicConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      accessToken: nonEmptyString,
      organizationId: nonEmptyString,
      platformUrl: new StringValue({url: true, emptyAllowed: false}),
    })
);

export interface UpdateSearchConfigurationActionCreatorPayload {
  /**
   * The Search API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/search/v2`).
   */
  apiBaseUrl?: string;

  /**
   * The name of the query pipeline to use for the query (e.g., `External Search`).
   */
  pipeline?: string;

  /**
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates (e.g., `ExternalSearch`).
   */
  searchHub?: string;

  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   */
  locale?: string;

  /**
   * The timezone of the current user. Must comply with the tz database: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones.
   */
  timezone?: string;
}

/**
 * Updates the search configuration.
 * @param apiBaseUrl (string) The Search API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/search/v2`).
 * @param pipeline (string) The name of the query pipeline to use for the query (e.g., `External Search`).
 * @param searchHub (string) The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates (e.g., `ExternalSearch`).
 * @param locale (string) The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
 * @param timezone (string) The timezone of the current user. Must comply with the tz database: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones.
 */
export const updateSearchConfiguration = createAction(
  'configuration/updateSearchConfiguration',
  (payload: UpdateSearchConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      apiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
      pipeline: nonEmptyString,
      searchHub: nonEmptyString,
      timezone: nonEmptyString,
      locale: nonEmptyString,
    })
);

export interface UpdateAnalyticsConfigurationActionCreatorPayload {
  /**
   * Whether to enable usage analytics tracking.
   */
  enabled?: boolean;

  /**
   * The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab from which the usage analytics event originates (e.g., `All`).
   */
  originLevel2?: string;

  /**
   * The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request (e.g., `https://connect.coveo.com/s/`).
   */
  originLevel3?: string;

  /**
   * The Usage Analytics API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/ua`).
   */
  apiBaseUrl?: string;

  /**
   * The Coveo analytics runtime to use, see https://github.com/coveo/coveo.analytics.js for more info.
   */
  runtimeEnvironment?: AnalyticsRuntimeEnvironment;
}

export type AnalyticsRuntimeEnvironment = IRuntimeEnvironment;

/**
 * Updates the analytics configuration.
 * @param enabled (boolean) Whether to enable usage analytics tracking.
 * @param originLevel2 (string) The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab from which the usage analytics event originates (e.g., `All`).
 * @param originLevel3 (string) The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request (e.g., `https://connect.coveo.com/s/`).
 * @param apiBaseUrl (string) The Usage Analytics API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/ua`).
 * @param runtimeEnvironment (IRuntimeEnvironment) The Coveo analytics runtime to use, see https://github.com/coveo/coveo.analytics.js for more info.
 */
export const updateAnalyticsConfiguration = createAction(
  'configuration/updateAnalyticsConfiguration',
  (payload: UpdateAnalyticsConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      enabled: new BooleanValue({default: true}),
      originLevel2: originSchemaOnConfigUpdate(),
      originLevel3: originSchemaOnConfigUpdate(),
      apiBaseUrl: new StringValue({url: true, emptyAllowed: false}),
      runtimeEnvironment: new Value(),
    })
);

/**
 * Disables analytics tracking.
 */
export const disableAnalytics = createAction('configuration/analytics/disable');
/**
 * Enables analytics tracking.
 */
export const enableAnalytics = createAction('configuration/analytics/enable');

export interface SetOriginLevel2ActionCreatorPayload {
  /**
   * The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab (e.g., `All`).
   */
  originLevel2: string;
}

/**
 * Sets originLevel2 for analytics tracking.
 * @param originLevel2 (string) The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab (e.g., `All`).
 */
export const setOriginLevel2 = createAction(
  'configuration/analytics/originlevel2',
  (payload: SetOriginLevel2ActionCreatorPayload) =>
    validatePayload(payload, {originLevel2: originSchemaOnUpdate()})
);

export interface SetOriginLevel3ActionCreatorPayload {
  /**
   * The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface (e.g., `https://connect.coveo.com/s/`).
   */
  originLevel3: string;
}

/**
 * Sets originLevel3 for analytics tracking.
 * @param originLevel3 (string) The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface (e.g., `https://connect.coveo.com/s/`).
 */
export const setOriginLevel3 = createAction(
  'configuration/analytics/originlevel3',
  (payload: SetOriginLevel3ActionCreatorPayload) =>
    validatePayload(payload, {originLevel3: originSchemaOnUpdate()})
);
