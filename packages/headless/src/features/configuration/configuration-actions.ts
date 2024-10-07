import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  SchemaDefinition,
  StringValue,
  Value,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {IRuntimeEnvironment} from 'coveo.analytics';
import {PlatformEnvironment} from '../../utils/url-utils.js';
import {
  nonEmptyString,
  validatePayload,
  requiredNonEmptyString,
  optionalNonEmptyVersionString,
} from '../../utils/validate-payload.js';
import {COVEO_FRAMEWORK, CoveoFramework} from '../../utils/version.js';

const originSchemaOnConfigUpdate = () => nonEmptyString;

const originSchemaOnUpdate = () => requiredNonEmptyString;

export interface UpdateBasicConfigurationActionCreatorPayload {
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken?: string;

  /**
   * The environment in which the organization is hosted.
   *
   * The `dev` and `stg` environments are only available internally for Coveo employees (e.g., Professional Services).
   */
  environment?: PlatformEnvironment;

  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
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
   * The base URL to use to proxy Coveo search requests (e.g., `https://example.com/search`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo searchrequests through your own
   * server. In most cases, you should not set this option.
   *
   * By default, no proxy is used and the Coveo Search API requests are sent directly to the Coveo platform through the
   * search [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e., `https://<organizationId>.org.coveo.com` or
   * `https://<organizationId>.org<environment>.coveo.com`, if the `environment` values is specified and different from
   * `prod`).
   *
   * If you set this option, you must also implement the following proxy endpoints on your server, otherwise the search
   * engine will not work properly:
   *
   * - `POST` `/` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/search/v2`](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/searchUsingPost)
   * - `POST` `/facet` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/search/v2/facet`](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/facetSearch)
   * - `GET` `/fields` to proxy requests to [`GET` `https://<organizationId>.org<environment|>.coveo.com/rest/search/v2/fields`](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/fields)
   * - `POST` `/html` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/search/v2/html`](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/htmlPost)
   * - `POST` `/plan` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/search/v2/plan`](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/planSearchUsingPost)
   * - `POST` `/querySuggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/search/v2/querySuggest`](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/querySuggestPost)
   */
  proxyBaseUrl?: string;

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
   * The origin level 2 usage analytics event metadata whose value should typically be the identifier of the tab from which the usage analytics event originates (e.g., `All`).
   */
  originLevel2?: string;

  /**
   * The origin level 3 usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request (e.g., `https://connect.coveo.com/s/`).
   */
  originLevel3?: string;

  /**
   * The base URL to use to proxy Coveo analytics requests (e.g., `https://example.com/analytics`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo analytics requests through your own
   * server. In most cases, you should not set this option.
   *
   * By default, no proxy is used and the Coveo analytics requests are sent directly to the Coveo platform through the
   * analytics [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e.,
   * `https://<organizationId>.analytics.org.coveo.com` or
   * `https://<organizationId>.analytics.org<environment>.coveo.com`, if the `environment` values is specified and
   * different from `prod`).
   *
   * If you set this option, you must also implement the correct proxy endpoints on your server, depending on the
   * `analyticsMode` you are using.
   *
   * If you are using the `next` analytics mode, you must implement the following proxy endpoints:
   *
   * - `POST` `/` to proxy requests to [`POST https://<organizationId>.analytics.org<environment|>.coveo.com/rest/organizations/{organizationId}/events/v1`](https://platform.cloud.coveo.com/docs?urls.primaryName=Event#/Event%20API/rest_organizations_paramId_events_v1_post)
   * - `POST` `/validate` to proxy requests to [`POST https://<organizationId>.analytics.org<environment|>.coveo.com/rest/organizations/{organizationId}/events/v1/validate`](https://platform.cloud.coveo.com/docs?urls.primaryName=Event#/Event%20API/rest_organizations_paramId_events_v1_validate_post)
   *
   * The [Event Protocol Reference](https://docs.coveo.com/en/n9da0377) provides documentation on the analytics event
   * schemas that can be passed as request bodies to the above endpoints.
   *
   * If your are using the `legacy` analytics mode, your `proxyBaseUrl` must end with `/rest/v15/analytics`, and you must implement the following proxy endpoints:
   *
   * - `POST` `/click` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/click`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_click)
   * - `POST` `/collect` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/collect`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_collect)
   * - `POST` `/custom` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/custom`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_custom)
   * - `GET` `/monitoring/health` to proxy requests to [`GET` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/monitoring/health`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/get__v15_analytics_monitoring_health)
   * - `POST` `/search` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/search`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_search)
   * - `POST` `/searches` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/searches`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_searches)
   * - `GET` `/status` to proxy requests to [`GET` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/status`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/get__v15_analytics_status)
   * - `POST` `/view` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/view`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_view)
   * - `DELETE` `/visit` to proxy requests to [`DELETE` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/visit`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/delete__v15_analytics_visit)
   * - `GET` `/visit` to proxy requests to [`GET` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/visit`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/get__v15_analytics_visit)
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
   * - `legacy`: The legacy analytics client, i.e., the Coveo Analytics.js library.
   * - `next`: The next analytics client, i.e., the Coveo Event Protocol with the Relay library.
   *
   * Starting at V3.0, the default value will be `next`.
   * @default 'legacy'
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
  trackingId: nonEmptyString,
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
