import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
} from './generated-answer-analytics-actions';

const mockMakeGeneratedAnswerFeedbackSubmit = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoSearchPageClient = jest.fn(() => ({
    disable: jest.fn(),
    makeGeneratedAnswerFeedbackSubmit: mockMakeGeneratedAnswerFeedbackSubmit,
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

  it('should log #logGeneratedAnswerFeedback with the right payload', async () => {
    await engine.dispatch(logGeneratedAnswerFeedback(exampleFeedback));

    const mockToUse = mockMakeGeneratedAnswerFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: exampleFeedback,
    };

    expect(mockToUse).toBeCalledTimes(1);
    expect(mockToUse).toBeCalledWith(expectedMetadata);
  });

  it('should log #logGeneratedAnswerDetailedFeedback with the right payload', async () => {
    await engine.dispatch(logGeneratedAnswerDetailedFeedback(exampleDetails));

    const mockToUse = mockMakeGeneratedAnswerFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: 'other',
      details: exampleDetails,
    };

    expect(mockToUse).toBeCalledTimes(1);
    expect(mockToUse).toBeCalledWith(expectedMetadata);
  });
});
