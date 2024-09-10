import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine';
import {buildMockNonEmptyResult} from '../../test/mock-result';
import {clearMicrotaskQueue} from '../../test/unit-test-utils';
import {logInstantResultOpen} from './instant-result-analytics-actions';

jest.mock('@coveo/relay');
jest.mock('coveo.analytics');

describe('#logRecommendationOpen', () => {
  const testResult = buildMockNonEmptyResult({searchUid: 'example searchUid'});
  let engine: SearchEngine;
  const makeDocumentOpen = jest.fn();
  const emit = jest.fn();

  beforeEach(() => {
    jest.mocked(CoveoSearchPageClient).mockReturnValue({
      makeDocumentOpen,
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
      engine.dispatch(logInstantResultOpen(testResult));
      await clearMicrotaskQueue();

      expect(makeDocumentOpen).toHaveBeenCalledTimes(1);
      expect(makeDocumentOpen.mock.calls[0]).toMatchSnapshot();
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
      engine.dispatch(logInstantResultOpen(testResult));
      await clearMicrotaskQueue();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
