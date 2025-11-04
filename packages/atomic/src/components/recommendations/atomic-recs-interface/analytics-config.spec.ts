import {
  getSampleRecommendationEngineConfiguration,
  type RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {describe, expect, it, vi} from 'vitest';
import {getAnalyticsConfig} from './analytics-config';

vi.mock('@coveo/headless/recommendation', {spy: true});

describe('#getAnalyticsConfig', () => {
  it('should return default configuration when analytics is not defined in recommendationEngineConfig', () => {
    const recommendationEngineConfig = {} as RecommendationEngineConfiguration;
    const enabled = true;
    const config = getAnalyticsConfig(recommendationEngineConfig, enabled);

    expect(config).toEqual(
      expect.objectContaining({
        enabled,
        source: {'@coveo/atomic': '0.0.0'},
        documentLocation: expect.any(String),
      })
    );
    expect(config).not.toHaveProperty('trackingId');
    expect(config.analyticsClientMiddleware).toBeInstanceOf(Function);

    if (config.originLevel3) {
      expect(config.originLevel3).toEqual(expect.any(String));
    }
  });

  it('should merge default configuration with recommendationEngineConfig.analytics', () => {
    const recommendationEngineConfig: RecommendationEngineConfiguration = {
      ...getSampleRecommendationEngineConfiguration(),
      analytics: {
        trackingId: 'test-tracking-id',
      },
    };
    const enabled = false;
    const config = getAnalyticsConfig(recommendationEngineConfig, enabled);

    expect(config).toEqual(
      expect.objectContaining({
        enabled,
        source: {'@coveo/atomic': '0.0.0'},
        trackingId: 'test-tracking-id',
        documentLocation: expect.any(String),
      })
    );
    expect(config.analyticsClientMiddleware).toBeInstanceOf(Function);

    if (config.originLevel3) {
      expect(config.originLevel3).toEqual(expect.any(String));
    }
  });

  it('should use next analytics config when analyticsMode is "next"', () => {
    const recommendationEngineConfig: RecommendationEngineConfiguration = {
      ...getSampleRecommendationEngineConfiguration(),
      analytics: {
        analyticsMode: 'next',
        trackingId: 'next-tracking-id',
      },
    };
    const enabled = true;
    const config = getAnalyticsConfig(recommendationEngineConfig, enabled);

    expect(config).toEqual(
      expect.objectContaining({
        enabled,
        source: {'@coveo/atomic': '0.0.0'},
        trackingId: 'next-tracking-id',
        documentLocation: expect.any(String),
      })
    );
    expect(config.analyticsClientMiddleware).toBeUndefined();

    if (config.originLevel3) {
      expect(config.originLevel3).toEqual(expect.any(String));
    }
  });
});
