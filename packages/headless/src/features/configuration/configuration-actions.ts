import {ArrayValue, BooleanValue, StringValue, Value} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {IRuntimeEnvironment} from 'coveo.analytics';
import {doNotTrack} from '../../utils/utils';
import {
  nonEmptyString,
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

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
   * The Platform URL to use (e.g., `https://platform.cloud.coveo.com`).
   */
  platformUrl?: string;
}

export const updateBasicConfiguration = createAction(
  'configuration/updateBasicConfiguration',
  (payload: UpdateBasicConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      accessToken: nonEmptyString,
      organizationId: nonEmptyString,
      platformUrl: nonEmptyString,
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
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone of the user.
   */
  timezone?: string;
  /**
   * Specifies the name of the authentication providers to use to perform queries.
   *
   * See [SAML Authentication](https://docs.coveo.com/en/91/).
   */
  authenticationProviders?: string[];
}

export const updateSearchConfiguration = createAction(
  'configuration/updateSearchConfiguration',
  (payload: UpdateSearchConfigurationActionCreatorPayload) => {
    return validatePayload(payload, {
      apiBaseUrl: nonEmptyString,
      pipeline: new StringValue({required: false, emptyAllowed: true}),
      searchHub: nonEmptyString,
      timezone: nonEmptyString,
      locale: nonEmptyString,
      authenticationProviders: new ArrayValue({
        required: false,
        each: requiredNonEmptyString,
      }),
    });
  }
);

export interface UpdateAnalyticsConfigurationActionCreatorPayload {
  /**
   * Whether to enable usage analytics tracking.
   */
  enabled?: boolean;

  /**
   * Sets the Origin Context dimension on the analytic events.
   *
   * You can use this dimension to specify the context of your application.
   * Suggested values are "Search", "InternalSearch" and "CommunitySearch"
   */
  originContext?: string;

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
   * The Usage Analytics API base URL to use (e.g., `https://platform.cloud.coveo.com/rest/organizations/${organizationId}/events/v1`).
   */
  nextApiBaseUrl?: string;

  /**
   * The Coveo analytics runtime to use, see https://github.com/coveo/coveo.analytics.js for more info.
   */
  runtimeEnvironment?: AnalyticsRuntimeEnvironment;
  /**
   * Whether analytics events should be logged anonymously.
   * If set to true, the Usage Analytics Write API will not extract the name and userDisplayName, if present, from the search token
   */
  anonymous?: boolean;
  /**
   *  The name of the device that the end user is using. It should be explicitly configured in the context of a native mobile app.
   */
  deviceId?: string;
  /**
   * Specifies the user display name for the usage analytics logs.
   */
  userDisplayName?: string;
  /**
   * Specifies the URL of the current page or component.
   */
  documentLocation?: string;
  /**
   * TBD
   */
  trackingId?: string;

  analyticsMode?: 'legacy' | 'next';
}

export type AnalyticsRuntimeEnvironment = IRuntimeEnvironment;

export const updateAnalyticsConfiguration = createAction(
  'configuration/updateAnalyticsConfiguration',
  (payload: UpdateAnalyticsConfigurationActionCreatorPayload) => {
    if (doNotTrack()) {
      payload.enabled = false;
    }
    return validatePayload(payload, {
      enabled: new BooleanValue({default: true}),
      originContext: originSchemaOnConfigUpdate(),
      originLevel2: originSchemaOnConfigUpdate(),
      originLevel3: originSchemaOnConfigUpdate(),
      apiBaseUrl: nonEmptyString,
      nextApiBaseUrl: nonEmptyString,
      runtimeEnvironment: new Value(),
      anonymous: new BooleanValue({default: false}),
      deviceId: nonEmptyString,
      userDisplayName: nonEmptyString,
      documentLocation: nonEmptyString,
      trackingId: nonEmptyString,
      analyticsMode: new StringValue<'legacy' | 'next'>({
        constrainTo: ['legacy', 'next'],
        required: false,
        default: 'legacy',
      }),
    });
  }
);

export const disableAnalytics = createAction('configuration/analytics/disable');
export const enableAnalytics = createAction('configuration/analytics/enable');

export interface SetOriginLevel2ActionCreatorPayload {
  /**
   * The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab (e.g., `All`).
   */
  originLevel2: string;
}

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

export const setOriginLevel3 = createAction(
  'configuration/analytics/originlevel3',
  (payload: SetOriginLevel3ActionCreatorPayload) =>
    validatePayload(payload, {originLevel3: originSchemaOnUpdate()})
);
