import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {describe, expect, it} from 'vitest';
import {getAnalyticsConfig} from './analytics-config';

describe('getAnalyticsConfig', () => {
  it('should return default configuration when analytics is not defined in commerceEngineConfig', () => {
    const commerceEngineConfig = {} as CommerceEngineConfiguration;
    const enabled = true;
    const config = getAnalyticsConfig(commerceEngineConfig, enabled);

    expect(config).toEqual({
      enabled,
      documentLocation: document.location.href,
      originLevel3: document.referrer,
      analyticsMode: 'next',
    });
  });

  it('should merge default configuration with commerceEngineConfig.analytics', () => {
    const commerceEngineConfig: CommerceEngineConfiguration =
      getSampleCommerceEngineConfiguration();
    const enabled = false;
    const config = getAnalyticsConfig(commerceEngineConfig, enabled);

    expect(config).toEqual({
      enabled,
      documentLocation: document.location.href,
      analyticsMode: 'next',
      originLevel3: document.referrer,
      trackingId: commerceEngineConfig.analytics.trackingId,
    });
  });
});
