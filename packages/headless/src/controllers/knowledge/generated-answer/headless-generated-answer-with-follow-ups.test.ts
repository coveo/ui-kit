import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import type {AnswerGenerationApiState} from '../../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {selectAnswer} from '../../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint.js';
import {getFollowUpAnswersInitialState} from '../../../features/follow-up-answers/follow-up-answers-state.js';
import {selectAnswerApiQueryParams} from '../../../features/generated-answer/answer-api-selectors.js';
import {generateHeadAnswer} from '../../../features/generated-answer/generated-answer-actions.js';
import {generatedAnswerAnalyticsClient} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {getGeneratedAnswerInitialState} from '../../../features/generated-answer/generated-answer-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import type {GeneratedAnswerProps} from '../../generated-answer/headless-generated-answer.js';
import {buildGeneratedAnswerWithFollowUps} from './headless-generated-answer-with-follow-ups.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);

vi.mock(
  '../../../features/generated-answer/answer-api-selectors.js',
  async () => {
    return {
      selectAnswerApiQueryParams: vi.fn(),
    };
  }
);

vi.mock(
  '../../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint',
  async () => {
    const original = await vi.importActual(
      '../../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint'
    );
    return {
      ...original,
      selectAnswer: vi.fn(),
    };
  }
);

describe('GeneratedAnswerWithFollowUps', () => {
  let engine: MockedSearchEngine;
  const mockSelectAnswer = vi.mocked(selectAnswer);
  const mockSelectAnswerApiQueryParams = vi.mocked(selectAnswerApiQueryParams);

  const createGeneratedAnswerWithFollowUps = (
    props: GeneratedAnswerProps = {}
  ) =>
    buildGeneratedAnswerWithFollowUps(
      engine,
      generatedAnswerAnalyticsClient,
      props
    );

  const buildEngineWithGeneratedAnswer = (
    initialState: Partial<AnswerGenerationApiState> = {}
  ) => {
    const state = createMockState({
      ...initialState,
      generatedAnswer: {
        ...getGeneratedAnswerInitialState(),
        ...initialState.generatedAnswer,
      },
      followUpAnswers: {
        ...getFollowUpAnswersInitialState(),
        ...initialState.followUpAnswers,
      },
      search: {
        ...initialState.search!,
        searchAction: {
          actionCause: 'searchboxSubmit',
        },
      },
    });
    return buildMockSearchEngine(state);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    engine = buildEngineWithGeneratedAnswer();
    mockSelectAnswerApiQueryParams.mockReturnValue({
      q: 'test query',
    });
  });

  it('initializes', () => {
    const controller = createGeneratedAnswerWithFollowUps();
    expect(controller).toBeTruthy();
  });

  it('adds the answerGenerationApi reducer to engine', () => {
    createGeneratedAnswerWithFollowUps();
    expect(engine.addReducers).toHaveBeenCalledWith({
      [answerGenerationApi.reducerPath]: answerGenerationApi.reducer,
    });
  });

  describe('state getter', () => {
    describe('RTK Query server state', () => {
      it('should map answer from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {answer: 'This is the answer'},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.answer).toBe('This is the answer');
      });

      it('should map citations from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {
            citations: [
              {id: 'c1', uri: 'http://example.com/1'},
              {id: 'c2', uri: 'http://example.com/2'},
            ],
          },
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.citations).toEqual([
          {id: 'c1', uri: 'http://example.com/1'},
          {id: 'c2', uri: 'http://example.com/2'},
        ]);
      });

      it('should default to empty array when citations is undefined', () => {
        mockSelectAnswer.mockReturnValue({
          data: {},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.citations).toEqual([]);
      });

      it('should map isLoading from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {isLoading: true},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.isLoading).toBe(true);
      });

      it('should map isStreaming from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {isStreaming: true},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.isStreaming).toBe(true);
      });

      it('should map error from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {error: {message: 'Server error', code: 500}},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.error).toEqual({
          message: 'Server error',
          code: 500,
        });
      });

      it('should map answerId from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {answerId: 'answer-123'},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.answerId).toBe('answer-123');
      });

      it('should map contentFormat from RTK Query data', () => {
        mockSelectAnswer.mockReturnValue({
          data: {contentFormat: 'text/markdown'},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.answerContentFormat).toBe('text/markdown');
      });

      it('should set isAnswerGenerated to true when generated is true', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: true},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.isAnswerGenerated).toBe(true);
      });

      it('should set isAnswerGenerated to false when generated is false', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: false},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.isAnswerGenerated).toBe(false);
      });

      it('should set cannotAnswer to true when generated is false', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: false},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.cannotAnswer).toBe(true);
      });

      it('should set cannotAnswer to false when generated is true', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: true},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.cannotAnswer).toBe(false);
      });
    });

    describe('Redux client state', () => {
      it('should map isVisible from Redux state', () => {
        engine = buildEngineWithGeneratedAnswer({
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            isVisible: true,
          },
        });

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.isVisible).toBe(true);
      });

      it('should map expanded from Redux state', () => {
        engine = buildEngineWithGeneratedAnswer({
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            expanded: true,
          },
        });

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.expanded).toBe(true);
      });

      it('should map liked from Redux state', () => {
        engine = buildEngineWithGeneratedAnswer({
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            liked: true,
          },
        });

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.liked).toBe(true);
      });

      it('should map disliked from Redux state', () => {
        engine = buildEngineWithGeneratedAnswer({
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            disliked: true,
          },
        });

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.disliked).toBe(true);
      });
    });

    describe('follow-up answers state', () => {
      it('should expose follow-up answers from Redux state', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: true, answer: 'main answer'},
        } as ReturnType<typeof selectAnswer>);

        const exampleFollowUpAnswers = {
          question: 'What about X?',
          answer: 'Answer about X',
          citations: [],
          answerId: 'follow-up-1',
          isLoading: false,
          isStreaming: false,
          liked: true,
          disliked: false,
          feedbackSubmitted: false,
          isAnswerGenerated: true,
          cannotAnswer: false,
          isActive: false,
        };

        engine = buildEngineWithGeneratedAnswer({
          followUpAnswers: {
            conversationId: 'session-123',
            isEnabled: true,
            followUpAnswers: [exampleFollowUpAnswers],
          },
        });

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.followUpAnswers).toEqual({
          conversationId: 'session-123',
          isEnabled: true,
          followUpAnswers: [exampleFollowUpAnswers],
        });
      });

      it('should expose empty follow-up answers when none exist', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: true, answer: 'main answer'},
        } as ReturnType<typeof selectAnswer>);

        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.followUpAnswers).toEqual({
          conversationId: '',
          isEnabled: false,
          followUpAnswers: [],
        });
      });
    });

    describe('selectAnswer with head-answer strategy', () => {
      it('should call selectAnswer with head-answer strategyKey', () => {
        mockSelectAnswerApiQueryParams.mockReturnValue({
          q: 'test query',
          searchHub: 'test-hub',
        });

        const controller = createGeneratedAnswerWithFollowUps();
        // Access state to trigger the getter
        controller.state;

        expect(mockSelectAnswer).toHaveBeenCalledWith(
          {
            q: 'test query',
            searchHub: 'test-hub',
            strategyKey: 'head-answer',
          },
          engine.state
        );
      });
    });
  });

  describe('retry method', () => {
    it('should dispatch generateHeadAnswer', () => {
      const controller = createGeneratedAnswerWithFollowUps();
      controller.retry();

      expect(generateHeadAnswer).toHaveBeenCalledTimes(1);
    });
  });
});
