import {createMockState} from '../../test/mock-state';
import {configureAnalytics} from './analytics';
import {CoveoAnalyticsClient} from 'coveo.analytics';

describe('analytics', () => {
  it('should be enabled by default', () => {
    const state = createMockState();
    expect(
      configureAnalytics(state).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be enabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analyticsEnabled = true;

    expect(
      configureAnalytics(state).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(true);
  });

  it('should be disabled if explicitly specified', () => {
    const state = createMockState();
    state.configuration.analyticsEnabled = false;
    expect(
      configureAnalytics(state).coveoAnalyticsClient instanceof
        CoveoAnalyticsClient
    ).toBe(false);
  });
});
