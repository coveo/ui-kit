import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {fromAnalyticsStateToAnalyticsParams} from './analytics-params';

describe('fromAnalyticsStateToAnalyticsParams', () => {
  it('analyticsMode is next and originLevel3 is default, it sends documentReferrer as null', async () => {
    const analytics = buildMockAnalyticsState({
      analyticsMode: 'next',
      originLevel3: 'default',
    });
    const res = await fromAnalyticsStateToAnalyticsParams(analytics);
    expect(res.analytics?.documentReferrer).toBe(null);
  });

  it('analyticsMode is legacy and originLevel3 is default, it sends documentReferrer as default', async () => {
    const analytics = buildMockAnalyticsState({
      analyticsMode: 'legacy',
      originLevel3: 'default',
    });
    const res = await fromAnalyticsStateToAnalyticsParams(analytics);
    expect(res.analytics?.documentReferrer).toBe('default');
  });
});
