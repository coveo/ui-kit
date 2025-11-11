import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '../../app/search-engine/search-engine.js';
import {buildMockRelay} from '../../test/mock-relay.js';
import {buildMockNonEmptyResult} from '../../test/mock-result.js';
import {clearMicrotaskQueue} from '../../test/unit-test-utils.js';
import {logDocumentOpen} from './result-analytics-actions.js';

vi.mock('@coveo/relay');
vi.mock('coveo.analytics');

describe('result analytics actions', () => {
  describe('#logDocumentOpen', () => {
    const testResult = buildMockNonEmptyResult({
      searchUid: 'example searchUid',
    });
    let engine: SearchEngine;
    const makeDocumentOpen = vi.fn();
    const emit = vi.fn();

    beforeEach(() => {
      vi.mocked(CoveoSearchPageClient).mockImplementation(function () {
        this.makeDocumentOpen = makeDocumentOpen;
      });
      vi.mocked(createRelay).mockReturnValue(buildMockRelay({emit}));
    });

    it('when analyticsMode is `legacy` should call coveo.analytics.makeDocumentOpen properly', async () => {
      engine = buildSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {
            analyticsMode: 'legacy',
          },
        },
      });

      engine.dispatch(logDocumentOpen(testResult));
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

      engine.dispatch(logDocumentOpen(testResult));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
