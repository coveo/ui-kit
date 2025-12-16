import type {IRuntimeEnvironment} from 'coveo.analytics';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import type {PlatformEnvironment} from '../../utils/url-utils.js';
import type {CoveoFramework} from '../../utils/version.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface CoreConfigurationState<
  Analytics extends CoreAnalyticsState = CoreAnalyticsState,
> {
  /**
   * The access token to use to authenticate requests against the Coveo endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo organization.
   */
  accessToken: string;

  /**
   * The global headless engine Usage Analytics API configuration.
   */
  analytics: Analytics;

  /**
   * The environment in which the Coveo cloud organization is hosted.
   *
   * The `dev` and `stg` environments are only available internally for Coveo employees (for example, Professional Services).
   *
   * Defaults to `prod`.
   */
  environment: PlatformEnvironment;

  /**
   * The unique identifier of the target Coveo organization (for example, `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
}

export interface ConfigurationState
  extends CoreConfigurationState<AnalyticsState> {
  /**
   * The global headless engine Search API configuration.
   */
  search: SearchState;
  /**
   * The global headless engine Knowledge configuration.
   */
  knowledge: KnowledgeState;
}

interface SearchState {
  /**
   * The Search API base URL to use.
   *
   * By default, will append `/rest/search/v2` to the automatically resolved
   * platform [organization endpoint](https://docs.coveo.com/en/mcc80216)
   * (that is, `https;://<ORG_ID>.org<hipaa|dev|stg|>.coveo.com`)
   *
   * If necessary, you can override this value by specifying a `proxyBaseUrl` in the `search` object of your engine
   * configuration, or when manually dispatching the `updateSearchConfiguration` action.
   */
  apiBaseUrl?: string;
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   */
  locale: string;
  /**
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets, and result items.
   * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
   */
  timezone: string;
  /**
   * Specifies the name of the authentication providers to use to perform queries.
   *
   * See [SAML Authentication](https://docs.coveo.com/en/91/).
   */
  authenticationProviders: string[];
}

export interface AnalyticsState extends CoreAnalyticsState {
  /**
   * Sets the Origin Context dimension on the analytics events.
   *
   * You can use this dimension to specify the context of your application.
   * Suggested values are "Search", "InternalSearch" and "CommunitySearch"
   *
   * By default, `Search`.
   */
  originContext: string;

  /**
   * Sets the value of the Origin Level 2 dimension on the analytics events.
   *
   * Origin level 2 is a usage analytics event metadata whose value should typically be the name/identifier of the tab from which the usage analytics event originates.
   *
   * In the context of product listing, the value should match the breadcrumb of the product listing page from which the usage analytics event originates (for example, `canoes-kayaks/kayaks/sea-kayaks`).
   *
   * When logging a usage analytics event, originLevel2 should always be set to the same value as the corresponding `tab` (parameter) Search API query parameter so Coveo Machine Learning models function properly, and usage analytics reports and dashboards are coherent.
   *
   * If left unspecified, this value will automatically try to resolve itself from the `tab` Search API query parameter.
   */
  originLevel2: string;

  /**
   * Origin level 3 is a usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request.
   *
   * When logging a Search usage analytics event, originLevel3 should always be set to the same value as the corresponding referrer Search API query parameter so usage analytics reports and dashboards are coherent.
   *
   * This value is optional, and will automatically try to resolve itself from the referrer search parameter.
   */
  originLevel3: string;

  /**
   * Optional analytics runtime environment, this is needed for analytics to work correctly if you're running outside of a browser.
   * See https://github.com/coveo/coveo.analytics.js for more info
   */
  runtimeEnvironment?: IRuntimeEnvironment;

  /**
   * Whether analytics events should be logged anonymously.
   * If set to true, the Usage Analytics Write API will not extract the name and userDisplayName, if present, from the search token
   */
  anonymous: boolean;

  /**
   *  The name of the device that the end user is using. It should be explicitly configured in the context of a native mobile app.
   */
  deviceId: string;

  /**
   * Specifies the user display name for the usage analytics logs.
   */
  userDisplayName: string;

  /**
   * Specifies the URL of the current page or component.
   */
  documentLocation: string;

  /**
   * Specifies the analytics mode to use.
   *
   * By default, `next`.
   * @internal
   */
  analyticsMode: 'legacy' | 'next';
}

export interface CoreAnalyticsState {
  /**
   * The Analytics API base URL to use.
   *
   * By default, will append `/rest/organizations/${organizationId}/events/v1` (or `/rest/v15/analytics` if
   * `analyticsMode`is set to `legacy`) to the automatically resolved analytics
   * [organization endpoint](https://docs.coveo.com/en/mcc80216)
   * (that is, `https;://<ORG_ID>.analytics.org<hipaa|dev|stg|>.coveo.com`)
   *
   * If necessary, you can override this value by specifying a `proxyBaseUrl` in the `analytics` object of your engine
   * configuration, or when manually dispatching the `updateAnalyticsConfiguration` action.
   */
  apiBaseUrl?: string;

  /**
   * Specifies if analytics tracking should be enabled. By default analytics events are tracked.
   */
  enabled: boolean;

  /**
   * Specifies the frameworks and version used around Headless (e.g. @coveo/atomic)
   * @internal
   */
  source: Partial<Record<CoveoFramework, string>>;

  /**
   * The unique identifier of the tracking target.
   * @internal
   */
  trackingId?: string;
}

interface KnowledgeState {
  answerConfigurationId: string;
}

export const getConfigurationInitialState: () => ConfigurationState = () => ({
  organizationId: '',
  accessToken: '',
  search: {
    locale: 'en-US',
    timezone: dayjs.tz.guess(),
    authenticationProviders: [],
  },
  analytics: {
    enabled: true,
    originContext: 'Search',
    originLevel2: 'default',
    originLevel3: 'default',
    anonymous: false,
    deviceId: '',
    userDisplayName: '',
    documentLocation: '',
    analyticsMode: 'next',
    source: {},
  },
  knowledge: {
    answerConfigurationId: '',
  },
  environment: 'prod',
});
