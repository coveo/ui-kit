import {createRelay} from '@coveo/relay';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {clearMicrotaskQueue} from '../../test/unit-test-utils';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  logCaseAttach,
  logCaseDetach,
} from './attached-results-analytics-actions';

const mockLogCaseAttach = jest.fn();
const mockLogCaseDetach = jest.fn();
const emit = jest.fn();

jest.mock('@coveo/relay');

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logCaseAttach: mockLogCaseAttach,
    logCaseDetach: mockLogCaseDetach,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

jest.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  updateConfig: jest.fn(),
  clearStorage: jest.fn(),
  version: 'foo',
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

const expectedMetadata = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
};

const expectedDocumentInfo = {
  queryPipeline: '',
  documentUri: 'example documentUri',
  documentUriHash: 'example documentUriHash',
  collectionName: 'example collectionName',
  sourceName: 'example sourceName',
  documentPosition: 1,
  documentTitle: 'example documentTitle',
  documentUrl: 'example documentUrl',
  rankingModifier: 'example rankingModifier',
  documentAuthor: 'example author',
};

const expectedDocumentIdentifier = {
  contentIDKey: 'permanentid',
  contentIDValue: 'example contentIDValue',
};

const resultParams = {
  title: 'example documentTitle',
  uri: 'example documentUri',
  printableUri: 'printable-uri',
  clickUri: 'example documentUrl',
  uniqueId: 'unique-id',
  excerpt: 'excerpt',
  firstSentences: 'first-sentences',
  flags: 'flags',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: 'example contentIDValue',
    author: 'example author',
  }),
};

const testResult = buildMockResult(resultParams);

describe('attached results analytics actions', () => {
  let engine: InsightEngine;
  const searchState = buildMockSearchState({
    results: [testResult],
    response: buildMockSearchResponse({
      searchUid: 'example searchUid',
    }),
  });
  const caseContextState = {
    caseContext: {
      Case_Subject: exampleSubject,
      Case_Description: exampleDescription,
    },
    caseId: exampleCaseId,
    caseNumber: exampleCaseNumber,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when analyticsMode is `legacy`', () => {
    beforeEach(() => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          search: searchState,
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          insightCaseContext: caseContextState,
        })
      );
    });

    describe('logCaseAttach', () => {
      it('should call coveo.analytics.logCaseAttach properly', async () => {
        await logCaseAttach(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(mockLogCaseAttach).toHaveBeenCalledTimes(1);
        expect(mockLogCaseAttach.mock.calls[0][0]).toStrictEqual(
          expectedDocumentInfo
        );
        expect(mockLogCaseAttach.mock.calls[0][1]).toStrictEqual(
          expectedDocumentIdentifier
        );
        expect(mockLogCaseAttach.mock.calls[0][2]).toStrictEqual(
          expectedMetadata
        );
      });
    });

    describe('logCaseDetach', () => {
      it('should call coveo.analytics.logCaseDetach properly', async () => {
        await logCaseDetach(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(mockLogCaseDetach).toHaveBeenCalledTimes(1);
        expect(mockLogCaseDetach.mock.calls[0][0]).toStrictEqual(
          testResult.raw.urihash
        );
        expect(mockLogCaseDetach.mock.calls[0][1]).toStrictEqual(
          expectedMetadata
        );
      });
    });
  });

  describe('when analyticsMode is `next`', () => {
    beforeEach(() => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          search: searchState,
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'next',
            },
          },
          insightCaseContext: caseContextState,
        })
      );
    });

    describe('logCaseAttach', () => {
      it('should call relay.emit properly', async () => {
        await logCaseAttach(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });

    describe('logCaseDetach', () => {
      it('should call relay.emit properly', async () => {
        await logCaseDetach(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });
  });
});
