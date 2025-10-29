import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  buildRecommendationEngine,
  type RecommendationEngine,
} from '../../app/recommendation-engine/recommendation-engine.js';
import {getSampleSearchEngineConfiguration} from '../../app/search-engine/search-engine.js';
import {buildMockRelay} from '../../test/mock-relay.js';
import {buildMockNonEmptyResult} from '../../test/mock-result.js';
import {clearMicrotaskQueue} from '../../test/unit-test-utils.js';
import {logRecommendationOpen} from './recommendation-analytics-actions.js';

vi.mock('@coveo/relay');
vi.mock('coveo.analytics');

describe('recommendation analytics actions', () => {
  describe('#logRecommendationOpen', () => {
    const testResult = buildMockNonEmptyResult({
      searchUid: 'example searchUid',
    });
    let engine: RecommendationEngine;
    const makeRecommendationOpen = vi.fn();
    const emit = vi.fn();

    beforeEach(() => {
      vi.mocked(CoveoSearchPageClient).mockImplementation(function () {
        this.makeRecommendationOpen = makeRecommendationOpen;
      });
      vi.mocked(createRelay).mockReturnValue(buildMockRelay({emit}));
    });

    it('when analyticsMode is `legacy` should call coveo.analytics.makeRecommendationOpen properly', async () => {
      engine = buildRecommendationEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {
            analyticsMode: 'legacy',
          },
        },
      });

      engine.dispatch(logRecommendationOpen(testResult));
      await clearMicrotaskQueue();

      expect(makeRecommendationOpen).toHaveBeenCalledTimes(1);
      expect(makeRecommendationOpen.mock.calls[0]).toMatchSnapshot();
    });

    it('when analyticsMode is `next`', async () => {
      engine = buildRecommendationEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {
            trackingId: 'alex',
          },
        },
      });

      engine.dispatch(logRecommendationOpen(testResult));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
