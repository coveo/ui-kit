import {createMockState} from '../../test/mock-state';
import {configureAnalytics} from './analytics';
import {CoveoAnalyticsClient} from 'coveo.analytics';
import pino from 'pino';

describe('analytics', () => {
  const logger = pino({level: 'silent'});
  it('should be enabled by default', () => {
    const state = createMockState();
    expect(
      configureAnalytics(state, logger).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = true;

    expect(
      configureAnalytics(state, logger).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = false;
    expect(
      configureAnalytics(state, logger).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(false);
  });
});
