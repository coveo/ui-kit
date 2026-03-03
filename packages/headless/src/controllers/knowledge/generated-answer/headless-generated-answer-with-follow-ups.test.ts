import * as followUpAgentModule from '../../../api/knowledge/answer-generation/agents/follow-up-agent/follow-up-agent.js';
import * as followUpStrategyModule from '../../../api/knowledge/answer-generation/agents/follow-up-agent/follow-up-answer-strategy.js';
import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import type {AnswerGenerationApiState} from '../../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {setAgentId} from '../../../features/configuration/configuration-actions.js';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state.js';
import {
  activeFollowUpStartFailed,
  createFollowUpAnswer,
  dislikeFollowUp,
  likeFollowUp,
} from '../../../features/follow-up-answers/follow-up-answers-actions.js';
import {followUpAnswersReducer} from '../../../features/follow-up-answers/follow-up-answers-slice.js';
import {getFollowUpAnswersInitialState} from '../../../features/follow-up-answers/follow-up-answers-state.js';
import {generateHeadAnswer} from '../../../features/generated-answer/generated-answer-actions.js';
import {generatedAnswerAnalyticsClient} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {getGeneratedAnswerInitialState} from '../../../features/generated-answer/generated-answer-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildGeneratedAnswerWithFollowUps,
  type GeneratedAnswerWithFollowUpsProps,
} from './headless-generated-answer-with-follow-ups.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock('../../../features/follow-up-answers/follow-up-answers-actions');
vi.mock('../../../features/configuration/configuration-actions');
vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);

const mockCoreLike = vi.fn();
const mockCoreDislike = vi.fn();
const mockCoreCopy = vi.fn();
const mockFollowUpAgent = {
  runAgent: vi.fn(),
  abortRun: vi.fn(),
};
const mockFollowUpStrategy = {};
const mockCreateFollowUpAgent = vi.spyOn(
  followUpAgentModule,
  'createFollowUpAgent'
);
const mockCreateFollowUpStrategy = vi.spyOn(
  followUpStrategyModule,
  'createFollowUpStrategy'
);
const mockCreateFollowUpAnswer = vi.mocked(createFollowUpAnswer);
const mockActiveFollowUpStartFailed = vi.mocked(activeFollowUpStartFailed);

vi.mock('../../core/generated-answer/headless-core-generated-answer.js', () => {
  return {
    buildCoreGeneratedAnswer: vi.fn(() => ({
      like: mockCoreLike,
      dislike: mockCoreDislike,
      logCopyToClipboard: mockCoreCopy,
    })),
  };
});

describe('GeneratedAnswerWithFollowUps', () => {
  let engine: MockedSearchEngine;
  const createGeneratedAnswerWithFollowUps = (
    props: GeneratedAnswerWithFollowUpsProps = {agentId: 'default-agent-id'}
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
      configuration: {
        ...getConfigurationInitialState(),
        organizationId: 'org-123',
        environment: 'prod',
        accessToken: 'foo',
      },
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
    mockCreateFollowUpAgent.mockReturnValue(mockFollowUpAgent as never);
    mockCreateFollowUpStrategy.mockReturnValue(mockFollowUpStrategy as never);
    engine = buildEngineWithGeneratedAnswer();
  });

  it('initializes', () => {
    const controller = createGeneratedAnswerWithFollowUps();
    expect(controller).toBeTruthy();
  });

  it('throws an error when agentId is empty', () => {
    expect(() => createGeneratedAnswerWithFollowUps({agentId: ''})).toThrow(
      'agentId is required for GeneratedAnswerWithFollowUps'
    );
  });

  it('throws an error when agentId is whitespace', () => {
    expect(() => createGeneratedAnswerWithFollowUps({agentId: '  '})).toThrow(
      'agentId is required for GeneratedAnswerWithFollowUps'
    );
  });

  it('should not throw an error when agentId is valid', () => {
    expect(() =>
      createGeneratedAnswerWithFollowUps({agentId: 'valid-agent-id'})
    ).not.toThrow();
  });

  it('adds the answerGenerationApi and followUpAnswers reducers to engine', () => {
    createGeneratedAnswerWithFollowUps();
    expect(engine.addReducers).toHaveBeenCalledWith({
      [answerGenerationApi.reducerPath]: answerGenerationApi.reducer,
      followUpAnswers: followUpAnswersReducer,
    });
  });

  it('should dispatch the setAgentId action', () => {
    createGeneratedAnswerWithFollowUps({agentId: 'test-agent-id'});

    expect(setAgentId).toHaveBeenCalledTimes(1);
    expect(setAgentId).toHaveBeenCalledWith('test-agent-id');
  });

  it('creates a follow-up agent with the configuration context', () => {
    createGeneratedAnswerWithFollowUps({agentId: 'agent-xyz'});

    expect(mockCreateFollowUpAgent).toHaveBeenCalledWith(
      'agent-xyz',
      'org-123',
      'prod'
    );
    expect(mockCreateFollowUpStrategy).toHaveBeenCalledWith(engine.dispatch);
  });

  describe('state getter', () => {
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
        const controller = createGeneratedAnswerWithFollowUps();

        expect(controller.state.followUpAnswers).toEqual({
          conversationId: '',
          isEnabled: false,
          followUpAnswers: [],
        });
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

  describe('like', () => {
    beforeEach(() => {
      engine = buildEngineWithGeneratedAnswer({
        generatedAnswer: {
          ...getGeneratedAnswerInitialState(),
          answerId: 'head-id',
        },
      });
    });

    it('should delegate to core like when no answerId is provided', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.like();

      expect(mockCoreLike).toHaveBeenCalledTimes(1);
      expect(likeFollowUp).not.toHaveBeenCalled();
    });

    it('should delegate to core like when answerId matches head answer', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.like('head-id');

      expect(mockCoreLike).toHaveBeenCalledTimes(1);
      expect(likeFollowUp).not.toHaveBeenCalled();
    });

    it('should dispatch likeFollowUp when answerId targets a follow-up answer', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.like('follow-1');

      expect(likeFollowUp).toHaveBeenCalledWith({answerId: 'follow-1'});
      expect(mockCoreLike).not.toHaveBeenCalled();
    });
  });

  describe('dislike', () => {
    beforeEach(() => {
      engine = buildEngineWithGeneratedAnswer({
        generatedAnswer: {
          ...getGeneratedAnswerInitialState(),
          answerId: 'head-id',
        },
      });
    });

    it('should delegate to core dislike when no answerId is provided', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.dislike();

      expect(mockCoreDislike).toHaveBeenCalledTimes(1);
      expect(dislikeFollowUp).not.toHaveBeenCalled();
    });

    it('should delegate to core dislike when answerId matches head answer', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.dislike('head-id');

      expect(mockCoreDislike).toHaveBeenCalledTimes(1);
      expect(dislikeFollowUp).not.toHaveBeenCalled();
    });

    it('should dispatch dislikeFollowUp when answerId targets a follow-up answer', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.dislike('follow-1');

      expect(dislikeFollowUp).toHaveBeenCalledWith({answerId: 'follow-1'});
      expect(mockCoreDislike).not.toHaveBeenCalled();
    });
  });

  describe('logCopyToClipboard', () => {
    beforeEach(() => {
      engine = buildEngineWithGeneratedAnswer({
        generatedAnswer: {
          ...getGeneratedAnswerInitialState(),
          answerId: 'head-id',
        },
      });
    });

    it('should delegate to core logCopyToClipboard when no answerId is provided', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.logCopyToClipboard();

      expect(mockCoreCopy).toHaveBeenCalledTimes(1);
    });

    it('should delegate to core logCopyToClipboard when answerId matches head answer', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.logCopyToClipboard('head-id');

      expect(mockCoreCopy).toHaveBeenCalledTimes(1);
    });
  });

  describe('askFollowUp method', () => {
    const question = 'Could you elaborate?';
    const conversationId = 'conversation-123';

    it('dispatches createFollowUpAnswer and runs the follow-up agent', () => {
      engine = buildEngineWithGeneratedAnswer({
        followUpAnswers: {
          ...getFollowUpAnswersInitialState(),
          conversationId,
        },
      });
      const controller = createGeneratedAnswerWithFollowUps();

      controller.askFollowUp(question);

      expect(mockFollowUpAgent.abortRun).toHaveBeenCalledTimes(1);
      expect(mockCreateFollowUpAnswer).toHaveBeenCalledWith({question});
      expect(mockFollowUpAgent.runAgent).toHaveBeenCalledWith(
        {
          forwardedProps: {
            q: question,
            conversationId,
            accessToken: 'foo',
          },
        },
        mockFollowUpStrategy
      );
    });

    it('does not run the agent when the question is empty', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.askFollowUp('   ');

      expect(mockCreateFollowUpAnswer).not.toHaveBeenCalled();
      expect(mockFollowUpAgent.runAgent).not.toHaveBeenCalled();
    });

    it('does not run the agent when the conversationId is missing', () => {
      const controller = createGeneratedAnswerWithFollowUps();

      controller.askFollowUp(question);

      expect(mockCreateFollowUpAnswer).not.toHaveBeenCalled();
      expect(mockFollowUpAgent.runAgent).not.toHaveBeenCalled();
    });

    it('dispatches activeFollowUpStartFailed and logs when the agent fails to start', async () => {
      engine = buildEngineWithGeneratedAnswer({
        followUpAnswers: {
          ...getFollowUpAnswersInitialState(),
          conversationId,
        },
      });
      const controller = createGeneratedAnswerWithFollowUps();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const failureAction = {type: 'follow-up/startFailed'};
      const error = new Error('network down');
      mockActiveFollowUpStartFailed.mockReturnValue(failureAction as never);
      mockFollowUpAgent.runAgent.mockRejectedValueOnce(error);

      await controller.askFollowUp(question);

      expect(mockFollowUpAgent.runAgent).toHaveBeenCalled();
      expect(mockActiveFollowUpStartFailed).toHaveBeenCalledWith({
        message:
          'An error occurred while starting the follow-up answer generation.',
      });
      expect(engine.dispatch).toHaveBeenCalledWith(failureAction);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error running the follow-up agent:',
        error
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
