import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {
  logGenerativeQuestionDetailedFeedback,
  logGenerativeQuestionFeedback,
} from './generated-answer-analytics-actions';

const mockMakeGenerativeQuestionFeedbackSubmit = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoSearchPageClient = jest.fn(() => ({
    disable: jest.fn(),
    makeGenerativeQuestionFeedbackSubmit:
      mockMakeGenerativeQuestionFeedbackSubmit,
  }));

  return {
    CoveoSearchPageClient: mockCoveoSearchPageClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleFeedback = 'irrelevant';
const exampleGenerativeQuestionAnsweringId = '123';
const exampleDetails = 'example details';

describe('the analytics related to the generated answer feature', () => {
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine({
      state: createMockState({
        search: buildMockSearchState({
          response: buildMockSearchResponse({
            extendedResults: {
              generativeQuestionAnsweringId:
                exampleGenerativeQuestionAnsweringId,
            },
          }),
        }),
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log #logGenerativeQuestionFeedback with the right payload', async () => {
    await engine.dispatch(logGenerativeQuestionFeedback(exampleFeedback));

    const mockToUse = mockMakeGenerativeQuestionFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: exampleFeedback,
    };

    expect(mockToUse).toBeCalledTimes(1);
    expect(mockToUse).toBeCalledWith(expectedMetadata);
  });

  it('should log #logGenerativeQuestionDetailedFeedback with the right payload', async () => {
    await engine.dispatch(
      logGenerativeQuestionDetailedFeedback(exampleDetails)
    );

    const mockToUse = mockMakeGenerativeQuestionFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: 'other',
      details: exampleDetails,
    };

    expect(mockToUse).toBeCalledTimes(1);
    expect(mockToUse).toBeCalledWith(expectedMetadata);
  });
});
