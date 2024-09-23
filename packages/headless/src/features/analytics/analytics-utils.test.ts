import {createRelay} from '@coveo/relay';
import {MockInstance} from 'vitest';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state.js';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockRecommendationState} from '../../test/mock-recommendation-state.js';
import {buildMockResultWithFolding} from '../../test/mock-result-with-folding.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  partialRecommendationInformation,
} from './analytics-utils.js';

vi.mock('@coveo/relay');

/* cSpell:ignore CAJS */

describe('analytics-utils', () => {
  describe('#partialDocumentInformation', () => {
    it('should extract documentation information with a single author', () => {
      const result = buildMockResult();
      result.raw['author'] = 'john';

      expect(
        partialDocumentInformation(result, createMockState()).documentAuthor
      ).toBe('john');
    });

    it('should extract documentation information with multiple author', () => {
      const result = buildMockResult();
      result.raw['author'] = ['john', 'doe'];

      expect(
        partialDocumentInformation(result, createMockState()).documentAuthor
      ).toBe('john;doe');
    });

    it('should extract document information when there is no author', () => {
      const result = buildMockResult();
      delete result.raw['author'];
      expect(
        partialDocumentInformation(result, createMockState()).documentAuthor
      ).toBe('unknown');
    });

    it('should extract sourceName information from source field', () => {
      const result = buildMockResult();
      result.raw.source = 'mysource';
      expect(
        partialDocumentInformation(result, createMockState()).sourceName
      ).toBe('mysource');
    });

    it('should extract sourceName information when there is no source field', () => {
      const result = buildMockResult();
      delete result.raw['source'];
      expect(
        partialDocumentInformation(result, createMockState()).sourceName
      ).toBe('unknown');
    });

    it('when the result is not found in state, the documentPosition is 1', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(1);
    });

    it('when the result is found in state, the documentPosition is the index + 1', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();
      state.search.results = state.search.response.results = [result];

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(1);
    });

    it('when the result is on a different page, the documentPosition is incremented', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();
      state.search.results = state.search.response.results = [result];
      state.pagination.firstResult = 15;

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(16);
    });

    it('when the result was fetched by fetchMoreResults, the documentPosition is incremented', () => {
      const oldResult = buildMockResult({uniqueId: '1'});
      const newResult = buildMockResult({uniqueId: '2'});
      const state = createMockState();
      state.search.response.results = [newResult];
      state.search.results = [oldResult, newResult];

      const {documentPosition} = partialDocumentInformation(newResult, state);
      expect(documentPosition).toBe(2);
    });

    it('when the result is found in child result, is uses the parent result position', () => {
      const result = buildMockResult({uniqueId: '1'});

      const parentResults = [
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
      ];
      parentResults[1].childResults = [
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
      ];
      parentResults[2].childResults = [
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
        buildMockResultWithFolding({uniqueId: '1'}),
      ];
      const state = createMockState();
      state.search.results = state.search.response.results = parentResults;
      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(3);
    });
  });

  describe('#partialRecommendationInformation', () => {
    it('when the recommendation is not found in state, the documentPosition is 0', () => {
      const recommendation = buildMockResult({uniqueId: '1'});
      const state = createMockRecommendationState();

      const {documentPosition} = partialRecommendationInformation(
        recommendation,
        state
      );
      expect(documentPosition).toBe(0);
    });

    it('when the recommendation is found in state, the documentPosition is the index + 1', () => {
      const recommendation = buildMockResult({uniqueId: '1'});
      const state = createMockRecommendationState();
      state.recommendation.recommendations = [recommendation];

      const {documentPosition} = partialRecommendationInformation(
        recommendation,
        state
      );
      expect(documentPosition).toBe(1);
    });
  });

  describe('#documentIdentifier', () => {
    it('should extract permanentid properly if available on a result', () => {
      const result = buildMockResult();
      result.raw.permanentid = 'qwerty';
      expect(documentIdentifier(result)).toMatchObject({
        contentIDKey: 'permanentid',
        contentIDValue: 'qwerty',
      });
    });

    it('should return an empty string if permanentid is not available on a result', () => {
      const result = buildMockResult();
      delete result.raw.permanentid;
      expect(documentIdentifier(result)).toMatchObject({
        contentIDKey: 'permanentid',
        contentIDValue: '',
      });
    });

    it('should log an error permanentid is not available on a result', () => {
      const spyConsole = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = buildMockResult();
      delete result.raw.permanentid;

      documentIdentifier(result);

      expect(spyConsole).toHaveBeenCalled();
      spyConsole.mockRestore();
    });
  });

  describe('#makeAnalytics', () => {
    let engine: MockedSearchEngine;
    let analyticsMode: 'legacy' | 'next';
    let relayEmitSpy: MockInstance;
    const fakeCAJSLog = vi.fn();
    const createRelayMocked = vi.mocked(createRelay);
    const baseMakeAnalyticParams = {
      prefix: 'analytics/noop',
      __legacy__getBuilder: () =>
        Promise.resolve({
          log: fakeCAJSLog,
          description: {actionCause: '🍷'},
        }),
    } as const;
    const additionalMakeAnalyticParamsForRelay = {
      analyticsPayloadBuilder: () => ({['🥔']: '🍅'}),
      analyticsType: '🥖',
    };
    function buildMockRelay() {
      relayEmitSpy = vi.fn();
      createRelayMocked.mockReturnValue({
        emit: relayEmitSpy as unknown as ReturnType<typeof createRelay>['emit'],
        on: vi.fn(),
        off: vi.fn(),
        getMeta: vi.fn(),
        updateConfig: vi.fn(),
        version: 'test',
      });
    }

    beforeEach(() => {
      vi.resetAllMocks();
      buildMockRelay();
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({analyticsMode}),
          },
        })
      );
    });

    describe('when analyticsMode=next', () => {
      beforeAll(() => {
        analyticsMode = 'next';
      });

      describe('when both `analyticsPayloadBuilder` and `analyticsType` are given', () => {
        it('should send event with only with relay when called', async () => {
          const action = makeAnalyticsAction({
            ...baseMakeAnalyticParams,
            ...additionalMakeAnalyticParamsForRelay,
          });

          await action()(
            engine.dispatch,
            () => engine.state,
            {} as ThunkExtraArguments
          );

          expect(fakeCAJSLog).not.toHaveBeenCalled();
          expect(relayEmitSpy).toHaveBeenCalled();
        });
      });

      describe.each(['analyticsPayloadBuilder', 'analyticsType'] as const)(
        'when %s is not given',
        (_missingArg) => {
          it('should not send any analytics when called', async () => {
            const {[_missingArg]: _, ...makeAnalyticsParam} = {
              ...baseMakeAnalyticParams,
              ...additionalMakeAnalyticParamsForRelay,
            };
            const action = makeAnalyticsAction(makeAnalyticsParam);

            await engine.dispatch(action);

            expect(fakeCAJSLog).not.toHaveBeenCalled();
            expect(relayEmitSpy).not.toHaveBeenCalled();
          });
        }
      );
    });

    describe('when analyticsMode=legacy', () => {
      beforeAll(() => {
        analyticsMode = 'legacy';
      });

      it('should send event only with CAJS when called', async () => {
        const action = makeAnalyticsAction({
          ...baseMakeAnalyticParams,
          ...additionalMakeAnalyticParamsForRelay,
        });

        await action()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(fakeCAJSLog).toHaveBeenCalled();
        expect(relayEmitSpy).not.toHaveBeenCalled();
      });
    });
  });
});
