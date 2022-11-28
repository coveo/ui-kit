import * as CoveoAnalytics from 'coveo.analytics';
import {
  buildMockResult,
  buildMockSearchAppEngine,
  createMockState,
  buildMockRaw,
} from '../../test';
import {buildMockSearchState} from '../../test/mock-search-state';
import {logCopyToClipboard} from './result-actions-analytics-actions';

const mockLogCopyToClipboard = jest.fn();

const mockCoveoSearchPageClient = jest.fn(() => ({
  disable: () => {},
  logCopyToClipboard: mockLogCopyToClipboard,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoSearchPageClient', {
  value: mockCoveoSearchPageClient,
});

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
  documentAuthor: 'unknown',
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
  excerpt: 'exceprt',
  firstSentences: 'first-sentences',
  flags: 'flags',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: 'example contentIDValue',
  }),
};

const testResult = buildMockResult(resultParams);

describe('logCopyToClipboard', () => {
  it('should log #logCopyToClipboard with the right payload', async () => {
    const engine = buildMockSearchAppEngine({
      state: {
        ...createMockState(),
        search: buildMockSearchState({
          results: [testResult],
        }),
      },
    });
    await engine.dispatch(logCopyToClipboard(testResult));

    expect(mockLogCopyToClipboard).toBeCalledTimes(1);
    expect(mockLogCopyToClipboard.mock.calls[0][0]).toStrictEqual(
      expectedDocumentInfo
    );
    expect(mockLogCopyToClipboard.mock.calls[0][1]).toStrictEqual(
      expectedDocumentIdentifier
    );
  });
});
