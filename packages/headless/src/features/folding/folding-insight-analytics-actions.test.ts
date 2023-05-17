import {buildMockRaw, buildMockResult} from '../../test';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockSearchState} from '../../test/mock-search-state';
import {
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
} from './folding-insight-analytics-actions';

const mockLogShowMoreFoldedResults = jest.fn();
const mockLogShowLessFoldedResults = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    logShowMoreFoldedResults: mockLogShowMoreFoldedResults,
    logShowLessFoldedResults: mockLogShowLessFoldedResults,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

const examplePermanentId = 'example permanent id';

const resultParams = {
  title: 'example documentTitle',
  uri: 'example documentUri',
  printableUri: 'printable-uri',
  clickUri: 'example documentUrl',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: examplePermanentId,
  }),
};

const exampleResult = buildMockResult(resultParams);

describe('the analytics related to the folding feature in the insight use case', () => {
  let engine: MockInsightEngine;

  beforeEach(() => {
    // build engine TODO
    engine = buildMockInsightEngine({
      state: buildMockInsightState({
        // TO DO - PASS RIGHT STUFF
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TODO
  it('should log #logShowMoreFoldedResults with the result payload', async () => {
    await engine.dispatch(logShowMoreFoldedResults(exampleResult));

    const mockToUse = mockLogShowMoreFoldedResults;
    expect(mockToUse).toBeCalledTimes(1);
    // expect().toStrictEqual(); // TODO
  });

  // TODO
  it('should log #logShowLessFoldedResults', async () => {
    await engine.dispatch(logShowLessFoldedResults());

    const mockToUse = mockLogShowLessFoldedResults;
    expect(mockToUse).toBeCalledTimes(1);
    // expect().toStrictEqual(); // TODO
  });
});
