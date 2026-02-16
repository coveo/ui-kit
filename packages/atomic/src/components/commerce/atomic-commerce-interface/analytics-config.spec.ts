import {
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {describe, expect, it, vi} from 'vitest';
import {getAnalyticsConfig} from './analytics-config';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('#getAnalyticsConfig', () => {
  it('should return default configuration when analytics is not defined in commerceEngineConfig', () => {
    const commerceEngineConfig = {} as CommerceEngineConfiguration;
    const enabled = true;
    const config = getAnalyticsConfig(commerceEngineConfig, enabled);

    expect(config).toEqual({
      enabled,
      source: {
        '@coveo/atomic': '0.0.0',
      },
    });
  });

  it('should merge default configuration with commerceEngineConfig.analytics', () => {
    const commerceEngineConfig: CommerceEngineConfiguration =
      getSampleCommerceEngineConfiguration();
    const enabled = false;
    const config = getAnalyticsConfig(commerceEngineConfig, enabled);

    expect(config).toEqual({
      enabled,
      source: {
        '@coveo/atomic': '0.0.0',
      },
      trackingId: commerceEngineConfig.analytics.trackingId,
    });
  });
});
