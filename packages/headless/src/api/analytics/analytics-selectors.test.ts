import {createMockState} from '../../test/mock-state.js';
import {VERSION} from '../../utils/version.js';
import {getAnalyticsSource} from './analytics-selectors.js';

describe('#getAnalyticsSources', () => {
  it('without a source, returns an array only with `@coveo/headless`', () => {
    const state = createMockState();
    expect(getAnalyticsSource(state.configuration.analytics)).toEqual([
      `@coveo/headless@${VERSION}`,
    ]);
  });

  it('with a source, returns an array with `@coveo/headless` and the serialized framework-version pair', () => {
    const state = createMockState();
    state.configuration.analytics.source = {
      '@coveo/atomic': '1.2.3',
    };
    expect(getAnalyticsSource(state.configuration.analytics)).toEqual([
      '@coveo/atomic@1.2.3',
      `@coveo/headless@${VERSION}`,
    ]);
  });
});
