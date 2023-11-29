import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {logCreateArticle} from './create-article-insight-analytics-actions';

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleCreateArticleMetadata = {
  articleType: 'Knowledge__kav',
  triggeredBy: 'CreateArticleButton',
};

const expectedCaseContext = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
};

const mockLogCreateArticle = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: jest.fn(),
    logCreateArticle: mockLogCreateArticle,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

describe('the analytics related to the create article feature in the insight use case', () => {
  let engine: MockInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine({
      state: buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log #logCreateArticle with the right payload', async () => {
    await engine.dispatch(logCreateArticle(exampleCreateArticleMetadata));
    const mockToUse = mockLogCreateArticle;
    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse.mock.calls[0][0]).toStrictEqual(
      exampleCreateArticleMetadata
    );
    expect(mockToUse.mock.calls[0][1]).toStrictEqual(expectedCaseContext);
  });
});
