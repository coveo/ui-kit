import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine.js';
import {buildMockNonEmptyResult} from '../../test/mock-result.js';
import {clearMicrotaskQueue} from '../../test/unit-test-utils.js';
import {logDocumentQuickview} from './result-preview-analytics-actions.js';

jest.mock('@coveo/relay');
jest.mock('coveo.analytics');

describe('result preview analytics actions', () => {
  describe('#logDocumentQuickview', () => {
    const testResult = buildMockNonEmptyResult();
    let engine: SearchEngine;
    const makeDocumentQuickview = jest.fn();
    const emit = jest.fn();

    beforeEach(() => {
      jest.mocked(CoveoSearchPageClient).mockReturnValue({
        makeDocumentQuickview,
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

      engine.dispatch(logDocumentQuickview(testResult));
      await clearMicrotaskQueue();

      expect(makeDocumentQuickview).toHaveBeenCalledTimes(1);
      expect(makeDocumentQuickview.mock.calls[0]).toMatchSnapshot();
    });

    it('when analyticsMode is `next` should call relay.emit properly', async () => {
      engine = buildSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {
            trackingId: 'alex',
          },
        },
      });

      engine.dispatch(logDocumentQuickview(testResult));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
