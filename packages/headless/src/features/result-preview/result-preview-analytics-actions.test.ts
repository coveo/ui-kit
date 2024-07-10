import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine';
import {buildMockNonEmptyResult} from '../../test/mock-result';
import {clearMicrotaskQueue} from '../../test/unit-test-utils';
import {logDocumentQuickview} from './result-preview-analytics-actions';

jest.mock('@coveo/relay');
jest.mock('coveo.analytics');

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

  describe('when analyticsMode is `legacy`', () => {
    beforeEach(() => {
      engine = buildSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
        },
      });
    });

    it('should call coveo.analytics.makeRecommendationOpen properly', async () => {
      engine.dispatch(logDocumentQuickview(testResult));
      await clearMicrotaskQueue();

      expect(makeDocumentQuickview).toHaveBeenCalledTimes(1);
      expect(makeDocumentQuickview.mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('when analyticsMode is `next`', () => {
    beforeEach(() => {
      engine = buildSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {
            analyticsMode: 'next',
            trackingId: 'alex',
          },
        },
      });
    });

    it('should call relay.emit properly', async () => {
      engine.dispatch(logDocumentQuickview(testResult));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
