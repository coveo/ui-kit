import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine';
import {buildMockNonEmptyResult} from '../../test/mock-result';
import {clearMicrotaskQueue} from '../../test/unit-test-utils';
import {logRecommendationOpen} from './recommendation-analytics-actions';

jest.mock('@coveo/relay');
jest.mock('coveo.analytics');

describe('recommendation analytics actions', () => {
  describe('#logRecommendationOpen', () => {
    const testResult = buildMockNonEmptyResult();
    let engine: SearchEngine;
    const makeRecommendationOpen = jest.fn();
    const emit = jest.fn();

    beforeEach(() => {
      jest.mocked(CoveoSearchPageClient).mockReturnValue({
        makeRecommendationOpen,
      } as unknown as CoveoSearchPageClient);
      jest.mocked(createRelay).mockReturnValue({
        emit,
        getMeta: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        updateConfig: jest.fn(),
        version: 'foo',
      });
    });

    it('when analyticsMode is `legacy` should call coveo.analytics.makeRecommendationOpen properly', async () => {
      engine = buildSearchEngine({
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
      engine = buildSearchEngine({
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
