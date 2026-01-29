import {buildMockCitation} from '../../test/mock-citation.js';
import {
  createFollowUpAnswer,
  dislikeFollowUp,
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  likeFollowUp,
  resetFollowUpAnswers,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpAnswersConversationId,
  setFollowUpIsLoading,
  setIsEnabled,
  submitFollowUpFeedback,
} from './follow-up-answers-actions.js';
import {followUpAnswersReducer} from './follow-up-answers-slice.js';
import {
  createInitialFollowUpAnswer,
  type FollowUpAnswersState,
  getFollowUpAnswersInitialState,
} from './follow-up-answers-state.js';

describe('follow-up answers slice', () => {
  let state: FollowUpAnswersState;

  beforeEach(() => {
    state = getFollowUpAnswersInitialState();
  });

  describe('#setIsEnabled', () => {
    it('sets isEnabled to true', () => {
      const finalState = followUpAnswersReducer(state, setIsEnabled(true));
      expect(finalState.isEnabled).toBe(true);
    });

    it('sets isEnabled to false', () => {
      state.isEnabled = true;
      const finalState = followUpAnswersReducer(state, setIsEnabled(false));
      expect(finalState.isEnabled).toBe(false);
    });
  });

  describe('#setFollowUpAnswersConversationId', () => {
    it('sets the conversationId', () => {
      const finalState = followUpAnswersReducer(
        state,
        setFollowUpAnswersConversationId('conv-123')
      );
      expect(finalState.conversationId).toBe('conv-123');
    });

    it('updates existing conversationId', () => {
      state.conversationId = 'old-conv';
      const finalState = followUpAnswersReducer(
        state,
        setFollowUpAnswersConversationId('new-conv')
      );
      expect(finalState.conversationId).toBe('new-conv');
    });
  });

  describe('#createFollowUpAnswer', () => {
    it('adds a new follow-up answer with default values', () => {
      const finalState = followUpAnswersReducer(
        state,
        createFollowUpAnswer({question: 'What is ABC?'})
      );

      expect(finalState.followUpAnswers).toHaveLength(1);
      expect(finalState.followUpAnswers[0]).toEqual({
        question: 'What is ABC?',
        isActive: true,
        isLoading: false,
        isStreaming: false,
        citations: [],
        liked: false,
        disliked: false,
        feedbackSubmitted: false,
        cannotAnswer: false,
      });
    });

    it('marks previous active follow-up as inactive', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('First?'), isActive: true},
      ];

      const finalState = followUpAnswersReducer(
        state,
        createFollowUpAnswer({question: 'Second?'})
      );

      expect(finalState.followUpAnswers[0].isActive).toBe(false);
      expect(finalState.followUpAnswers[1].isActive).toBe(true);
    });

    it('appends to existing follow-up answers', () => {
      state.followUpAnswers = [createInitialFollowUpAnswer('First?')];

      const finalState = followUpAnswersReducer(
        state,
        createFollowUpAnswer({question: 'Second?'})
      );

      expect(finalState.followUpAnswers).toHaveLength(2);
      expect(finalState.followUpAnswers[1].question).toBe('Second?');
    });
  });

  describe('#setActiveFollowUpAnswerId', () => {
    it('sets answerId on the active follow-up', () => {
      state.followUpAnswers = [createInitialFollowUpAnswer('Question?')];

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerId('answer-123')
      );

      expect(finalState.followUpAnswers[0].answerId).toBe('answer-123');
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerId('answer-123')
      );

      expect(finalState).toEqual(state);
    });

    it('does nothing when active follow-up already has an answerId', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'existing-id'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerId('new-id')
      );

      expect(finalState.followUpAnswers[0].answerId).toBe('existing-id');
    });

    it('only updates the active follow-up', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('First?'),
          isActive: false,
          answerId: 'id-1',
        },
        {...createInitialFollowUpAnswer('Second?'), isActive: true},
      ];

      const finalState = followUpAnswersReducer(
        state,
        setActiveFollowUpAnswerId('answer-123')
      );

      expect(finalState.followUpAnswers[0].answerId).toBe('id-1');
      expect(finalState.followUpAnswers[1].answerId).toBe('answer-123');
    });
  });

  describe('#setFollowUpAnswerContentFormat', () => {
    it('sets content format for matching answerId', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        setFollowUpAnswerContentFormat({
          answerId: 'answer-123',
          contentFormat: 'text/markdown',
        })
      );

      expect(finalState.followUpAnswers[0].answerContentFormat).toBe(
        'text/markdown'
      );
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        setFollowUpAnswerContentFormat({
          answerId: 'different-id',
          contentFormat: 'text/markdown',
        })
      );

      expect(finalState.followUpAnswers[0].answerContentFormat).toBeUndefined();
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        setFollowUpAnswerContentFormat({
          answerId: 'answer-123',
          contentFormat: 'text/markdown',
        })
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#setFollowUpIsLoading', () => {
    it('sets isLoading for matching answerId', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        setFollowUpIsLoading({answerId: 'answer-123', isLoading: true})
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(true);
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        setFollowUpIsLoading({answerId: 'different-id', isLoading: true})
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        setFollowUpIsLoading({answerId: 'answer-123', isLoading: true})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#followUpMessageChunkReceived', () => {
    it('initializes answer with textDelta when undefined', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpMessageChunkReceived({
          answerId: 'answer-123',
          textDelta: 'Hello',
        })
      );

      expect(finalState.followUpAnswers[0].answer).toBe('Hello');
    });

    it('appends textDelta to existing answer', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          answer: 'Hello',
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpMessageChunkReceived({
          answerId: 'answer-123',
          textDelta: ' world',
        })
      );

      expect(finalState.followUpAnswers[0].answer).toBe('Hello world');
    });

    it('sets isLoading to false and isStreaming to true', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          isLoading: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpMessageChunkReceived({
          answerId: 'answer-123',
          textDelta: 'text',
        })
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(true);
    });

    it('deletes error when message is received', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          error: {message: 'error', code: 500},
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpMessageChunkReceived({
          answerId: 'answer-123',
          textDelta: 'text',
        })
      );

      expect(finalState.followUpAnswers[0].error).toBeUndefined();
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          answer: 'example',
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpMessageChunkReceived({
          answerId: 'different-id',
          textDelta: 'text',
        })
      );

      expect(finalState.followUpAnswers[0].answer).toBe('example');
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        followUpMessageChunkReceived({
          answerId: 'answer-123',
          textDelta: 'text',
        })
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#followUpCitationsReceived', () => {
    it('sets citations for matching answerId', () => {
      const citations = [
        buildMockCitation({id: 'c1', uri: 'uri1'}),
        buildMockCitation({id: 'c2', uri: 'uri2'}),
      ];
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({answerId: 'answer-123', citations})
      );

      expect(finalState.followUpAnswers[0].citations).toEqual(citations);
    });

    it('appends citations to existing ones', () => {
      const existing = [buildMockCitation({id: 'c1', uri: 'uri1'})];
      const newCitations = [buildMockCitation({id: 'c2', uri: 'uri2'})];
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          citations: existing,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({
          answerId: 'answer-123',
          citations: newCitations,
        })
      );

      expect(finalState.followUpAnswers[0].citations).toHaveLength(2);
      expect(finalState.followUpAnswers[0].citations).toEqual([
        ...existing,
        ...newCitations,
      ]);
    });

    it('filters out duplicate citations by URI', () => {
      const existing = [buildMockCitation({id: 'c1', uri: 'same-uri'})];
      const duplicate = [buildMockCitation({id: 'c2', uri: 'same-uri'})];
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          citations: existing,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({
          answerId: 'answer-123',
          citations: duplicate,
        })
      );

      expect(finalState.followUpAnswers[0].citations).toHaveLength(1);
      expect(finalState.followUpAnswers[0].citations[0].id).toBe('c1');
    });

    it('sets isLoading to false and isStreaming to true', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          isLoading: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({answerId: 'answer-123', citations: []})
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(true);
    });

    it('deletes error when citations are received', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          error: {message: 'error', code: 500},
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({answerId: 'answer-123', citations: []})
      );

      expect(finalState.followUpAnswers[0].error).toBeUndefined();
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({
          answerId: 'different-id',
          citations: [buildMockCitation()],
        })
      );

      expect(finalState.followUpAnswers[0].citations).toEqual([]);
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        followUpCitationsReceived({answerId: 'answer-123', citations: []})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#followUpCompleted', () => {
    it('sets completion flags for matching answerId', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          isLoading: true,
          isStreaming: true,
          isActive: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCompleted({answerId: 'answer-123'})
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(false);
      expect(finalState.followUpAnswers[0].isActive).toBe(false);
      expect(finalState.followUpAnswers[0].cannotAnswer).toBe(false);
    });

    it('sets cannotAnswer when provided', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCompleted({answerId: 'answer-123', cannotAnswer: true})
      );

      expect(finalState.followUpAnswers[0].cannotAnswer).toBe(true);
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          isActive: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpCompleted({answerId: 'different-id'})
      );

      expect(finalState.followUpAnswers[0].isActive).toBe(true);
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        followUpCompleted({answerId: 'answer-123'})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#followUpFailed', () => {
    it('sets error for matching answerId', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpFailed({
          answerId: 'answer-123',
          message: 'Error occurred',
          code: 500,
        })
      );

      expect(finalState.followUpAnswers[0].error).toEqual({
        answerId: 'answer-123',
        message: 'Error occurred',
        code: 500,
      });
    });

    it('sets isLoading and isStreaming to false', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          isLoading: true,
          isStreaming: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpFailed({answerId: 'answer-123', message: 'error'})
      );

      expect(finalState.followUpAnswers[0].isLoading).toBe(false);
      expect(finalState.followUpAnswers[0].isStreaming).toBe(false);
    });

    it('clears citations', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          citations: [buildMockCitation()],
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpFailed({answerId: 'answer-123', message: 'error'})
      );

      expect(finalState.followUpAnswers[0].citations).toEqual([]);
    });

    it('deletes answer', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          answer: 'Some answer',
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpFailed({answerId: 'answer-123', message: 'error'})
      );

      expect(finalState.followUpAnswers[0].answer).toBeUndefined();
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          answer: 'Some answer',
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        followUpFailed({answerId: 'different-id', message: 'error'})
      );

      expect(finalState.followUpAnswers[0].answer).toBe('Some answer');
      expect(finalState.followUpAnswers[0].error).toBeUndefined();
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        followUpFailed({answerId: 'answer-123', message: 'error'})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#likeFollowUp', () => {
    it('sets liked to true and disliked to false', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        likeFollowUp({answerId: 'answer-123'})
      );

      expect(finalState.followUpAnswers[0].liked).toBe(true);
      expect(finalState.followUpAnswers[0].disliked).toBe(false);
    });

    it('overrides previous dislike', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          disliked: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        likeFollowUp({answerId: 'answer-123'})
      );

      expect(finalState.followUpAnswers[0].liked).toBe(true);
      expect(finalState.followUpAnswers[0].disliked).toBe(false);
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        likeFollowUp({answerId: 'different-id'})
      );

      expect(finalState.followUpAnswers[0].liked).toBe(false);
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        likeFollowUp({answerId: 'answer-123'})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#dislikeFollowUp', () => {
    it('sets disliked to true and liked to false', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        dislikeFollowUp({answerId: 'answer-123'})
      );

      expect(finalState.followUpAnswers[0].disliked).toBe(true);
      expect(finalState.followUpAnswers[0].liked).toBe(false);
    });

    it('overrides previous like', () => {
      state.followUpAnswers = [
        {
          ...createInitialFollowUpAnswer('Question?'),
          answerId: 'answer-123',
          liked: true,
        },
      ];

      const finalState = followUpAnswersReducer(
        state,
        dislikeFollowUp({answerId: 'answer-123'})
      );

      expect(finalState.followUpAnswers[0].disliked).toBe(true);
      expect(finalState.followUpAnswers[0].liked).toBe(false);
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        dislikeFollowUp({answerId: 'different-id'})
      );

      expect(finalState.followUpAnswers[0].disliked).toBe(false);
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        dislikeFollowUp({answerId: 'answer-123'})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#submitFollowUpFeedback', () => {
    it('sets feedbackSubmitted to true', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        submitFollowUpFeedback({answerId: 'answer-123'})
      );

      expect(finalState.followUpAnswers[0].feedbackSubmitted).toBe(true);
    });

    it('does nothing when answerId does not match', () => {
      state.followUpAnswers = [
        {...createInitialFollowUpAnswer('Question?'), answerId: 'answer-123'},
      ];

      const finalState = followUpAnswersReducer(
        state,
        submitFollowUpFeedback({answerId: 'different-id'})
      );

      expect(finalState.followUpAnswers[0].feedbackSubmitted).toBe(false);
    });

    it('does nothing when no follow-ups exist', () => {
      const finalState = followUpAnswersReducer(
        state,
        submitFollowUpFeedback({answerId: 'answer-123'})
      );

      expect(finalState).toEqual(state);
    });
  });

  describe('#resetFollowUpAnswers', () => {
    it('clears all follow-up answers', () => {
      state.followUpAnswers = [
        createInitialFollowUpAnswer('First?'),
        createInitialFollowUpAnswer('Second?'),
      ];

      const finalState = followUpAnswersReducer(state, resetFollowUpAnswers());

      expect(finalState.followUpAnswers).toEqual([]);
    });

    it('clears conversationId', () => {
      state.conversationId = 'conv-123';
      state.followUpAnswers = [createInitialFollowUpAnswer('Question?')];

      const finalState = followUpAnswersReducer(state, resetFollowUpAnswers());

      expect(finalState.conversationId).toBe('');
    });

    it('preserves isEnabled', () => {
      state.isEnabled = true;
      state.followUpAnswers = [createInitialFollowUpAnswer('Question?')];

      const finalState = followUpAnswersReducer(state, resetFollowUpAnswers());

      expect(finalState.isEnabled).toBe(true);
      expect(finalState.followUpAnswers).toEqual([]);
    });

    it('works when already empty', () => {
      const finalState = followUpAnswersReducer(state, resetFollowUpAnswers());

      expect(finalState.followUpAnswers).toEqual([]);
      expect(finalState.conversationId).toBe('');
    });
  });
});
