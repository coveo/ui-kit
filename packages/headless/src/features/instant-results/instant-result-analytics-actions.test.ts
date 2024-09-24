import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine.js';
import {buildMockNonEmptyResult} from '../../test/mock-result.js';
import {clearMicrotaskQueue} from '../../test/unit-test-utils.js';
import {logInstantResultOpen} from './instant-result-analytics-actions.js';

vi.mock('@coveo/relay');
vi.mock('coveo.analytics');

describe('instant result analytics actions', () => {
  describe('#logRecommendationOpen', () => {
    const testResult = buildMockNonEmptyResult({
      searchUid: 'example searchUid',
    });
    let engine: SearchEngine;
    const makeDocumentOpen = vi.fn();
    const emit = vi.fn();

    beforeEach(() => {
      vi.mocked(CoveoSearchPageClient).mockReturnValue({
        makeDocumentOpen,
      } as unknown as CoveoSearchPageClient);
      vi.mocked(createRelay).mockReturnValue({
        emit,
        getMeta: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        updateConfig: vi.fn(),
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

      engine.dispatch(logInstantResultOpen(testResult));
      await clearMicrotaskQueue();

      expect(makeDocumentOpen).toHaveBeenCalledTimes(1);
      expect(makeDocumentOpen.mock.calls[0]).toMatchSnapshot();
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

      engine.dispatch(logInstantResultOpen(testResult));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
