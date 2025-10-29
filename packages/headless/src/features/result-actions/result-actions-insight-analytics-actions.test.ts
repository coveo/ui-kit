import {createRelay} from '@coveo/relay';
import {CoveoInsightClient} from 'coveo.analytics';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {buildMockRaw} from '../../test/mock-raw.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {clearMicrotaskQueue} from '../../test/unit-test-utils.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  logCaseSendEmail,
  logCopyToClipboard,
  logFeedItemTextPost,
} from './result-actions-insight-analytics-actions.js';

const mockLogCopyToClipboard = vi.fn();
const mockLogCaseSendEmail = vi.fn();
const mockLogFeedItemTextPost = vi.fn();
const emit = vi.fn();

vi.mock('@coveo/relay');

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logCopyToClipboard = mockLogCopyToClipboard;
  this.logCaseSendEmail = mockLogCaseSendEmail;
  this.logFeedItemTextPost = mockLogFeedItemTextPost;
});

vi.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  updateConfig: vi.fn(),
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
  searchUid: 'example searchUid',
  raw: buildMockRaw({
    author: 'example author',
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: 'example contentIDValue',
  }),
};

const testResult = buildMockResult(resultParams);

describe('result actions insight analytics actions', () => {
  let engine: InsightEngine;
  const searchState = buildMockSearchState({
    results: [testResult],
    response: buildMockSearchResponse(),
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
    vi.clearAllMocks();
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

    describe('logCopyToClipboard', () => {
      it('should call coveo.analytics.logCopyToClipboard properly', async () => {
        await logCopyToClipboard(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(mockLogCopyToClipboard).toHaveBeenCalledTimes(1);
        expect(mockLogCopyToClipboard.mock.calls[0][0]).toStrictEqual(
          expectedDocumentInfo
        );
        expect(mockLogCopyToClipboard.mock.calls[0][1]).toStrictEqual(
          expectedDocumentIdentifier
        );
        expect(mockLogCopyToClipboard.mock.calls[0][2]).toStrictEqual(
          expectedMetadata
        );
      });
    });

    describe('logCaseSendEmail', () => {
      it('should call coveo.analytics.logCaseSendEmail properly', async () => {
        await logCaseSendEmail(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(mockLogCaseSendEmail).toHaveBeenCalledTimes(1);
        expect(mockLogCaseSendEmail.mock.calls[0][0]).toStrictEqual(
          expectedDocumentInfo
        );
        expect(mockLogCaseSendEmail.mock.calls[0][1]).toStrictEqual(
          expectedDocumentIdentifier
        );
        expect(mockLogCaseSendEmail.mock.calls[0][2]).toStrictEqual(
          expectedMetadata
        );
      });
    });

    describe('logFeedItemTextPost', () => {
      it('should call coveo.analytics.logFeedItemTextPost properly', async () => {
        await logFeedItemTextPost(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(mockLogFeedItemTextPost).toHaveBeenCalledTimes(1);
        expect(mockLogFeedItemTextPost.mock.calls[0][0]).toStrictEqual(
          expectedDocumentInfo
        );
        expect(mockLogFeedItemTextPost.mock.calls[0][1]).toStrictEqual(
          expectedDocumentIdentifier
        );
        expect(mockLogFeedItemTextPost.mock.calls[0][2]).toStrictEqual(
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

    describe('logCopyToClipboard', () => {
      it('should call relay.emit properly', async () => {
        await logCopyToClipboard(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });

    describe('logCaseSendEmail', () => {
      it('should call relay.emit properly', async () => {
        await logCaseSendEmail(testResult)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });

    describe('logFeedItemTextPost', () => {
      it('should call relay.emit properly', async () => {
        await logFeedItemTextPost(testResult)()(
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
