import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {PlatformEnvironment} from '../../../utils/url-utils.js';
import {
  nonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  UpdateAnalyticsConfigurationActionCreatorPayload,
  UpdateBasicConfigurationActionCreatorPayload,
  analyticsConfigurationSchema,
} from '../../configuration/configuration-actions.js';

export type UpdateBasicConfigurationPayload =
  UpdateBasicConfigurationActionCreatorPayload;

export const updateBasicConfiguration = createAction(
  'commerce/configuration/updateBasicConfiguration',
  (payload: UpdateBasicConfigurationPayload) =>
    validatePayload(payload, {
      accessToken: nonEmptyString,
      environment: new StringValue<PlatformEnvironment>({
        required: false,
        constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
      }),
      organizationId: nonEmptyString,
    })
);

export type UpdateProxyBaseUrlPayload = {
  /**
   * The base URL to use to proxy Coveo commerce requests (e.g., `https://example.com/commerce`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo commerce requests through your own
   * server. In most cases, you should not set this option.
   *
   * By default, no proxy is used and the Coveo commerce requests are sent directly to the Coveo platform through the
   * platform [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e.,
   * `https://<organizationId>.org.coveo.com` or
   * `https://<organizationId>.org<environment>.coveo.com`, if the `environment` values is specified and
   * different from `prod`).
   *
   * If you set this option, you must also implement the following proxy endpoints on your server, otherwise the
   * commerce engine will not work properly:
   *
   * - `POST` `/facet` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/facet`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Facet/operation/facet)
   * - `POST` `/listing` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/listing`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Listings/operation/getListing)
   * - `POST` `/productSuggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/productSuggest`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Search/operation/productSuggest)
   * - `POST` `/querySuggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/querySuggest`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Search/operation/querySuggest)
   * - `POST` `/recommendations` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/recommendations`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Recommendations/operation/recommendations)
   * - `POST` `/search` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/search`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Search/operation/search)
   **/
  proxyBaseUrl?: string;
};

export const updateProxyBaseUrl = createAction(
  'commerce/configuration/updateProxyBaseUrl',
  (payload: UpdateProxyBaseUrlPayload) =>
    validatePayload(payload, {
      proxyBaseUrl: new StringValue({required: false, url: true}),
    })
);

export type UpdateAnalyticsConfigurationPayload = Pick<
  UpdateAnalyticsConfigurationActionCreatorPayload,
  'enabled' | 'proxyBaseUrl' | 'source' | 'trackingId'
>;

export const updateAnalyticsConfiguration = createAction(
  'commerce/configuration/updateAnalyticsConfiguration',
  (payload: UpdateAnalyticsConfigurationPayload) => {
    return validatePayload(payload, {
      enabled: analyticsConfigurationSchema.enabled,
      proxyBaseUrl: analyticsConfigurationSchema.proxyBaseUrl,
      source: analyticsConfigurationSchema.source,
      trackingId: analyticsConfigurationSchema.trackingId,
    });
  }
);

export const disableAnalytics = createAction(
  'commerce/configuration/analytics/disable'
);

export const enableAnalytics = createAction(
  'commerce/configuration/analytics/enable'
);
