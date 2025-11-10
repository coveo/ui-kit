import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  type SchemaDefinition,
  StringValue,
  Value,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {IRuntimeEnvironment} from 'coveo.analytics';
import type {PlatformEnvironment} from '../../utils/url-utils.js';
import {
  nonEmptyString,
  optionalNonEmptyVersionString,
  optionalTrackingId,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {COVEO_FRAMEWORK, type CoveoFramework} from '../../utils/version.js';

const originSchemaOnConfigUpdate = () => nonEmptyString;

const originSchemaOnUpdate = () => requiredNonEmptyString;

export interface UpdateBasicConfigurationActionCreatorPayload {
  /**
   * The access token to use to authenticate requests against the Coveo endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo organization.
   */
  accessToken?: string;

  /**
   * The environment in which the organization is hosted.
   *
   * The `dev` and `stg` environments are only available internally for Coveo employees (for example, Professional Services).
   */
  environment?: PlatformEnvironment;

  /**
   * The unique identifier of the target Coveo organization (for example, `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId?: string;
}

export const updateBasicConfiguration = createAction(
  'configuration/updateBasicConfiguration',
  (payload: UpdateBasicConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      accessToken: nonEmptyString,
      environment: new StringValue<PlatformEnvironment>({
        required: false,
        constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
      }),
      organizationId: nonEmptyString,
    })
);

export interface UpdateSearchConfigurationActionCreatorPayload {
  /**
   * The base URL to use to proxy Coveo search requests (for example, `https://example.com/search`).
   *
   * This is an advanced option that you only set if you proxy Coveo searchrequests through your own
   * server. In most cases, you should not set this option.
   *
   *  See [Headless proxy: Search](https://docs.coveo.com/en/headless/latest/usage/proxy#search).
   */
  proxyBaseUrl?: string;

  /**
   * The name of the query pipeline to use for the query (for example, `External Search`).
   */
  pipeline?: string;

  /**
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates (for example, `ExternalSearch`).
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
      proxyBaseUrl: new StringValue({required: false, url: true}),
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
   * The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab from which the usage analytics event originates (for example, `All`).
   */
  originLevel2?: string;

  /**
   * The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request (for example, `https://connect.coveo.com/s/`).
   */
  originLevel3?: string;

  /**
   * The base URL to use to proxy Coveo analytics requests (for example, `https://example.com/analytics`).
   *
   * This is an advanced option that you only set if you proxy Coveo analytics requests through your own
   * server. In most cases, you should not set this option.
   *
   * See [Headless proxy: Analytics](https://docs.coveo.com/en/headless/latest/usage/proxy#analytics).
   */
  proxyBaseUrl?: string;

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
   * The unique identifier of the tracking target.
   */
  trackingId?: string;
  /**
   * The analytics client to use.
   * - `legacy`: The legacy analytics client, that is, the Coveo Analytics.js library.
   * - `next`: The next analytics client, that is, the Coveo Event Protocol with the Relay library.
   *
   * @default 'next'
   */
  analyticsMode?: 'legacy' | 'next';
  /**
   * Specifies the frameworks and version used around Headless (e.g. @coveo/atomic).
   * @internal
   */
  source?: Partial<Record<CoveoFramework, string>>;
}

export type AnalyticsRuntimeEnvironment = IRuntimeEnvironment;

export const analyticsConfigurationSchema: SchemaDefinition<
  Required<UpdateAnalyticsConfigurationActionCreatorPayload>
> = {
  enabled: new BooleanValue({default: true}),
  originContext: originSchemaOnConfigUpdate(),
  originLevel2: originSchemaOnConfigUpdate(),
  originLevel3: originSchemaOnConfigUpdate(),
  proxyBaseUrl: new StringValue({required: false, url: true}),
  runtimeEnvironment: new Value(),
  anonymous: new BooleanValue({default: false}),
  deviceId: nonEmptyString,
  userDisplayName: nonEmptyString,
  documentLocation: nonEmptyString,
  trackingId: optionalTrackingId,
  analyticsMode: new StringValue<'legacy' | 'next'>({
    constrainTo: ['legacy', 'next'],
    required: false,
    default: 'next',
  }),
  source: new RecordValue({
    options: {required: false},
    values: COVEO_FRAMEWORK.reduce(
      (acc, framework) => {
        acc[framework] = optionalNonEmptyVersionString;
        return acc;
      },
      {} as Record<CoveoFramework, StringValue>
    ),
  }),
};

export const updateAnalyticsConfiguration = createAction(
  'configuration/updateAnalyticsConfiguration',
  (payload: UpdateAnalyticsConfigurationActionCreatorPayload) => {
    return validatePayload(payload, analyticsConfigurationSchema);
  }
);

export const disableAnalytics = createAction('configuration/analytics/disable');
export const enableAnalytics = createAction('configuration/analytics/enable');

export interface SetOriginLevel2ActionCreatorPayload {
  /**
   * The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab (for example, `All`).
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
   * The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface (for example, `https://connect.coveo.com/s/`).
   */
  originLevel3: string;
}

export const setOriginLevel3 = createAction(
  'configuration/analytics/originlevel3',
  (payload: SetOriginLevel3ActionCreatorPayload) =>
    validatePayload(payload, {originLevel3: originSchemaOnUpdate()})
);
