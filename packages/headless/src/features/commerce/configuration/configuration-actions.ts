import {createAction} from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {
  UpdateAnalyticsConfigurationActionCreatorPayload,
  UpdateBasicConfigurationActionCreatorPayload,
  analyticsConfigurationSchema,
} from '../../configuration/configuration-actions';

export type UpdateBasicConfigurationPayload =
  UpdateBasicConfigurationActionCreatorPayload;

export const updateBasicConfiguration = createAction(
  'commerce/configuration/updateBasicConfiguration',
  (payload: UpdateBasicConfigurationPayload) =>
    validatePayload(payload, {
      accessToken: nonEmptyString,
      organizationId: nonEmptyString,
      platformUrl: nonEmptyString,
    })
);

export type UpdateAnalyticsConfigurationPayload = Pick<
  UpdateAnalyticsConfigurationActionCreatorPayload,
  'enabled' | 'source' | 'trackingId'
>;

export const updateAnalyticsConfiguration = createAction(
  'commerce/configuration/updateAnalyticsConfiguration',
  (payload: UpdateAnalyticsConfigurationPayload) => {
    return validatePayload(payload, {
      enabled: analyticsConfigurationSchema.enabled,
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
