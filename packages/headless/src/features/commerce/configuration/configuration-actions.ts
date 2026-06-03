import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {PlatformEnvironment} from '../../../utils/url-utils.js';
import {
  nonEmptyString,
  requiredTrackingId,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  analyticsConfigurationSchema,
  type UpdateAnalyticsConfigurationActionCreatorPayload,
  type UpdateBasicConfigurationActionCreatorPayload,
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
   * The base URL to use to proxy Coveo commerce requests (for example, `https://example.com/commerce`).
   *
   * This is an advanced option that you only set if you proxy Coveo commerce requests through your own
   * server. In most cases, you should not set this option.
   *
   *  See [Headless proxy: Commerce](https://docs.coveo.com/en/headless/latest/usage/proxy#commerce).
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
      trackingId: requiredTrackingId,
    });
  }
);

export const disableAnalytics = createAction(
  'commerce/configuration/analytics/disable'
);

export const enableAnalytics = createAction(
  'commerce/configuration/analytics/enable'
);
