import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import {
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../../app/search-engine/search-engine';
import {buildMockNonEmptyResult} from '../../test/mock-result';
import {logDocumentOpen} from './result-analytics-actions';

jest.mock('@coveo/relay');
jest.mock('coveo.analytics');

async function wait() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('#logDocumentOpen', () => {
  const testResult = buildMockNonEmptyResult();
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
      clearStorage: jest.fn(),
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

    it('should call coveo.analytics.makeDocumentOpen properly', async () => {
      engine.dispatch(logDocumentOpen(testResult));
      await wait();

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
      engine.dispatch(logDocumentOpen(testResult));
      await wait();

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
