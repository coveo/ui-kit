import {beforeEach, describe, expect, it} from 'vitest';
import {buildMockCitation} from '../../test/mock-citation.js';
import {
  addFollowUpAnswer,
  resetFollowUpAnswers,
  setActiveFollowUpAnswerCitations,
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpError,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  setFollowUpAnswersSessionId,
  setIsEnabled,
  updateActiveFollowUpAnswerMessage,
} from './follow-up-answers-actions.js';
import {followUpAnswersReducer} from './follow-up-answers-slice.js';
import {
  createInitialFollowUpAnswer,
  type FollowUpAnswersState,
  getFollowUpAnswersInitialState,
} from './follow-up-answers-state.js';

describe('follow-up answers slice', () => {
  let baseState: FollowUpAnswersState;

  beforeEach(() => {
    baseState = getFollowUpAnswersInitialState();
  });

  describe('#setIsEnabled', () => {
    it('should set isEnabled to true', () => {
      const finalState = followUpAnswersReducer(baseState, setIsEnabled(true));

      expect(finalState.isEnabled).toBe(true);
    });

    it('should set isEnabled to false', () => {
      const initialState = {...baseState, isEnabled: true};
      const finalState = followUpAnswersReducer(
        initialState,
        setIsEnabled(false)
      );

      expect(finalState.isEnabled).toBe(false);
    });
  });

  describe('#addFollowUpAnswer', () => {
    it('should add a new follow-up answer with default values', () => {
      const question = 'Test question?';
      const finalState = followUpAnswersReducer(
        baseState,
        addFollowUpAnswer(question)
      );

      expect(finalState.followUpAnswers).toHaveLength(1);
      const followUp = finalState.followUpAnswers[0];
      expect(followUp.isLoading).toBe(false);
      expect(followUp.isStreaming).toBe(false);
      expect(followUp.citations).toEqual([]);
      expect(followUp.liked).toBe(false);
      expect(followUp.disliked).toBe(false);
      expect(followUp.feedbackSubmitted).toBe(false);
      expect(followUp.cannotAnswer).toBe(false);
    });

    it('should append to existing follow-up answers', () => {
      const firstQuestion = 'First question?';
      const secondQuestion = 'Second question?';

      let state = followUpAnswersReducer(
        baseState,
        addFollowUpAnswer(firstQuestion)
      );
      state = followUpAnswersReducer(state, addFollowUpAnswer(secondQuestion));

      expect(state.followUpAnswers).toHaveLength(2);
      expect(state.followUpAnswers[0].question).toBe(firstQuestion);
      expect(state.followUpAnswers[1].question).toBe(secondQuestion);
    });
  });

  describe('#setActiveFollowUpAnswerContentFormat', () => {
    it('should set content format for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerContentFormat('text/markdown')
      );

      expect(finalState.followUpAnswers[0].answerContentFormat).toBe(
        'text/markdown'
      );
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpAnswerContentFormat('text/markdown')
      );

      expect(finalState).toEqual(baseState);
    });

    it('should only update the last follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          createInitialFollowUpAnswer('First?'),
          createInitialFollowUpAnswer('Second?'),
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerContentFormat('text/markdown')
      );

      expect(finalState.followUpAnswers[0].answerContentFormat).toBeUndefined();
      expect(finalState.followUpAnswers[1].answerContentFormat).toBe(
        'text/markdown'
      );
    });
  });

  describe('#setActiveFollowUpAnswerId', () => {
    it('should set answer ID for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerId('answer-123')
      );

      expect(finalState.followUpAnswers[0].answerId).toBe('answer-123');
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpAnswerId('answer-123')
      );

      expect(finalState).toEqual(baseState);
    });

    it('should only update the last follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          createInitialFollowUpAnswer('First?'),
          createInitialFollowUpAnswer('Second?'),
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerId('answer-123')
      );

      expect(finalState.followUpAnswers[0].answerId).toBeUndefined();
      expect(finalState.followUpAnswers[1].answerId).toBe('answer-123');
    });
  });

  describe('#setActiveFollowUpIsLoading', () => {
    it('should set isLoading to true for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpIsLoading(true)
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(true);
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpIsLoading(true)
      );

      expect(finalState).toEqual(baseState);
    });

    it('should only update the last follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          createInitialFollowUpAnswer('First?'),
          createInitialFollowUpAnswer('Second?'),
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpIsLoading(true)
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[1].isLoading).toBe(true);
    });
  });

  describe('#setActiveFollowUpIsStreaming', () => {
    it('should set isStreaming to true for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpIsStreaming(true)
      );

      expect(finalState.followUpAnswers[0].isStreaming).toBe(true);
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpIsStreaming(true)
      );

      expect(finalState).toEqual(baseState);
    });

    it('should only update the last follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          createInitialFollowUpAnswer('First?'),
          createInitialFollowUpAnswer('Second?'),
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpIsStreaming(true)
      );

      expect(finalState.followUpAnswers[0].isStreaming).toBe(false);
      expect(finalState.followUpAnswers[1].isStreaming).toBe(true);
    });
  });

  describe('#updateActiveFollowUpAnswerMessage', () => {
    it('should concatenate textDelta with existing answer', () => {
      const existingAnswer = 'Hello';
      const state = {
        ...baseState,
        followUpAnswers: [
          {...createInitialFollowUpAnswer('Question?'), answer: existingAnswer},
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        updateActiveFollowUpAnswerMessage({textDelta: ' world'})
      );

      expect(finalState.followUpAnswers[0].answer).toBe('Hello world');
    });

    it('should initialize answer with textDelta when answer is undefined', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            isLoading: true,
            isStreaming: false,
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        updateActiveFollowUpAnswerMessage({textDelta: 'First text'})
      );

      expect(finalState.followUpAnswers[0].answer).toBe('First text');
      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(true);
    });

    it('should delete any existing error', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            error: {message: 'Error occurred', code: 500},
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        updateActiveFollowUpAnswerMessage({textDelta: 'text'})
      );

      expect(finalState.followUpAnswers[0].error).toBeUndefined();
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        updateActiveFollowUpAnswerMessage({textDelta: 'text'})
      );

      expect(finalState).toEqual(baseState);
    });

    it('should only update the last follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {...createInitialFollowUpAnswer('First?'), answer: 'Existing answer'},
          {...createInitialFollowUpAnswer('Second?'), answer: 'Hello '},
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        updateActiveFollowUpAnswerMessage({textDelta: 'World!'})
      );

      expect(finalState.followUpAnswers[0].answer).toBe('Existing answer');
      expect(finalState.followUpAnswers[1].answer).toBe('Hello World!');
    });
  });

  describe('#setActiveFollowUpAnswerCitations', () => {
    it('should add citations to the active follow-up answer', () => {
      const citations = [
        buildMockCitation({uri: '1'}),
        buildMockCitation({uri: '2'}),
      ];
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            isLoading: true,
            isStreaming: false,
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerCitations({citations})
      );

      expect(finalState.followUpAnswers[0].citations).toEqual(citations);
      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(true);
    });

    it('should append citations to existing citations', () => {
      const existingCitations = [buildMockCitation()];
      const newCitations = [buildMockCitation({id: 'new-id', uri: 'new-uri'})];
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            citations: existingCitations,
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerCitations({citations: newCitations})
      );

      expect(finalState.followUpAnswers[0].citations).toEqual([
        ...existingCitations,
        ...newCitations,
      ]);
    });

    it('should filter out duplicate citations with same URI', () => {
      const existingCitations = [
        buildMockCitation({id: 'id-1', uri: 'duplicate-uri'}),
      ];
      const newCitations = [
        buildMockCitation({id: 'id-2', uri: 'duplicate-uri'}),
      ];
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            citations: existingCitations,
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerCitations({citations: newCitations})
      );

      expect(finalState.followUpAnswers[0].citations).toEqual(
        existingCitations
      );
    });

    it('should delete any existing error', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            error: {message: 'Error occurred', code: 500},
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerCitations({citations: []})
      );

      expect(finalState.followUpAnswers[0].error).toBeUndefined();
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpAnswerCitations({citations: []})
      );

      expect(finalState).toEqual(baseState);
    });

    it('should only update the last follow-up answer', () => {
      const citations = [
        buildMockCitation({uri: '1'}),
        buildMockCitation({uri: '2'}),
      ];
      const state = {
        ...baseState,
        followUpAnswers: [
          createInitialFollowUpAnswer('First?'),
          createInitialFollowUpAnswer('Question?'),
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerCitations({citations})
      );

      expect(finalState.followUpAnswers[0].citations).toEqual([]);
      expect(finalState.followUpAnswers[1].citations).toEqual(citations);
    });
  });

  describe('#setActiveFollowUpError', () => {
    const errorPayload = {
      message: 'An error occurred',
      code: 500,
    };

    it('should set error for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpError(errorPayload)
      );

      expect(finalState.followUpAnswers[0].error).toEqual(errorPayload);
    });

    it('should set isLoading and isStreaming flags to false', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question?'),
            isLoading: true,
            isStreaming: true,
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpError(errorPayload)
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(false);
    });

    it('should clear citations of the active follow up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question 1?'),
            citations: [buildMockCitation()],
          },
          {
            ...createInitialFollowUpAnswer('Question 2?'),
            citations: [buildMockCitation()],
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpError(errorPayload)
      );

      expect(finalState.followUpAnswers[0].citations).toEqual([
        buildMockCitation(),
      ]);
      expect(finalState.followUpAnswers[1].citations).toEqual([]);
    });

    it('should delete the answer of the active follow up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {
            ...createInitialFollowUpAnswer('Question 1?'),
            answer: 'Some answer',
          },
          {
            ...createInitialFollowUpAnswer('Question 2?'),
            answer: 'Some answer',
          },
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpError(errorPayload)
      );

      expect(finalState.followUpAnswers[0].answer).toBe('Some answer');
      expect(finalState.followUpAnswers[1].answer).toBeUndefined();
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpError(errorPayload)
      );

      expect(finalState).toEqual(baseState);
    });
  });

  describe('#setActiveFollowUpCannotAnswer', () => {
    it('should set cannotAnswer to true for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpCannotAnswer(true)
      );

      expect(finalState.followUpAnswers[0].cannotAnswer).toBe(true);
    });

    it('should set cannotAnswer to false for the active follow-up answer', () => {
      const state = {
        ...baseState,
        followUpAnswers: [
          {...createInitialFollowUpAnswer('Question?'), cannotAnswer: true},
        ],
      };

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpCannotAnswer(false)
      );

      expect(finalState.followUpAnswers[0].cannotAnswer).toBe(false);
    });

    it('should not modify state when no follow-up answers exist', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        setActiveFollowUpCannotAnswer(true)
      );

      expect(finalState).toEqual(baseState);
    });
  });

  describe('#resetFollowUpAnswers', () => {
    it('should clear all follow-up answers and session id', () => {
      const state = {
        ...baseState,
        id: 'session-123',
        followUpAnswers: [
          createInitialFollowUpAnswer('First?'),
          createInitialFollowUpAnswer('Second?'),
          createInitialFollowUpAnswer('Third?'),
        ],
      };

      const finalState = followUpAnswersReducer(state, resetFollowUpAnswers());

      expect(finalState.followUpAnswers).toEqual([]);
      expect(finalState.id).toBe('');
    });

    it('should preserve the isEnabled property', () => {
      const state = {
        ...baseState,
        id: 'session-123',
        isEnabled: true,
        followUpAnswers: [createInitialFollowUpAnswer('Question?')],
      };

      const finalState = followUpAnswersReducer(state, resetFollowUpAnswers());

      expect(finalState.id).toBe('');
      expect(finalState.isEnabled).toBe(true);
      expect(finalState.followUpAnswers).toEqual([]);
    });

    it('should work when follow-up answers are already empty', () => {
      const finalState = followUpAnswersReducer(
        baseState,
        resetFollowUpAnswers()
      );

      expect(finalState.followUpAnswers).toEqual([]);
    });
  });

  describe('#setFollowUpAnswersSessionId', () => {
    it('should set the session id', () => {
      const sessionId = 'session-abc-123';
      const finalState = followUpAnswersReducer(
        baseState,
        setFollowUpAnswersSessionId(sessionId)
      );

      expect(finalState.id).toBe(sessionId);
    });

    it('should update existing session id', () => {
      const state = {...baseState, id: 'old-session-id'};
      const newSessionId = 'new-session-id';

      const finalState = followUpAnswersReducer(
        state,
        setFollowUpAnswersSessionId(newSessionId)
      );

      expect(finalState.id).toBe(newSessionId);
    });
  });
});
