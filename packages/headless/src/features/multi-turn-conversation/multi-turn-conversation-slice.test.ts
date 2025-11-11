import {buildMockCitation} from '../../test/mock-citation.js';
import {
  addAnswer,
  markActiveAnswerComplete,
  resetConversation,
  updateActiveAnswer,
  updateCitationsToActiveAnswer,
} from './multi-turn-conversation-actions.js';
import {multiTurnReducer} from './multi-turn-conversation-slice.js';
import {getMultiTurnConversationInitialState} from './multi-turn-conversation-state.js';

describe('multi-turn conversation slice', () => {
  let state: ReturnType<typeof getMultiTurnConversationInitialState>;

  beforeEach(() => {
    state = getMultiTurnConversationInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = multiTurnReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      conversationId: '',
      answers: [],
    });
  });

  describe('#resetConversation', () => {
    it('sets the conversationId to the passed value', () => {
      const conversationId = 'test-conversation-123';
      const action = resetConversation({conversationId});
      const finalState = multiTurnReducer(state, action);

      expect(finalState.conversationId).toBe(conversationId);
    });

    it('clears all answers', () => {
      // Add some answers to the state first
      state = multiTurnReducer(state, addAnswer({prompt: 'First question'}));
      state = multiTurnReducer(state, addAnswer({prompt: 'Second question'}));
      expect(state.answers).toHaveLength(2);

      const conversationId = 'new-conversation';
      const action = resetConversation({conversationId});
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers).toEqual([]);
      expect(finalState.conversationId).toBe(conversationId);
    });
  });

  describe('#addAnswer', () => {
    it('adds a new conversation turn with the correct initial state', () => {
      const prompt = 'What is the meaning of life?';
      const action = addAnswer({prompt});
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers).toHaveLength(1);
      expect(finalState.answers[0]).toEqual({
        answer: '',
        prompt,
        citations: [],
        isStreaming: false,
        isLoading: true,
        error: null,
        cannotAnswer: false,
      });
    });

    it('adds multiple answers in sequence', () => {
      const firstPrompt = 'First question';
      const secondPrompt = 'Second question';

      let finalState = multiTurnReducer(
        state,
        addAnswer({prompt: firstPrompt})
      );
      finalState = multiTurnReducer(
        finalState,
        addAnswer({prompt: secondPrompt})
      );

      expect(finalState.answers).toHaveLength(2);
      expect(finalState.answers[0].prompt).toBe(firstPrompt);
      expect(finalState.answers[1].prompt).toBe(secondPrompt);
    });
  });

  describe('#updateActiveAnswer', () => {
    beforeEach(() => {
      // Add an answer to work with
      state = multiTurnReducer(state, addAnswer({prompt: 'Test question'}));
    });

    it('updates the last answer when there is one answer', () => {
      const updates = {
        answer: 'The answer is 42',
        isStreaming: true,
      };
      const action = updateActiveAnswer(updates);
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers[0]).toEqual({
        answer: 'The answer is 42',
        prompt: 'Test question',
        citations: [],
        isStreaming: true,
        isLoading: true,
        error: null,
        cannotAnswer: false,
      });
    });

    it('updates only the last answer when there are multiple answers', () => {
      // Add a second answer
      state = multiTurnReducer(state, addAnswer({prompt: 'Second question'}));

      const updates = {
        answer: 'Updated answer',
        error: 'Something went wrong',
      };
      const action = updateActiveAnswer(updates);
      const finalState = multiTurnReducer(state, action);

      // First answer should remain unchanged
      expect(finalState.answers[0]).toEqual({
        answer: '',
        prompt: 'Test question',
        citations: [],
        isStreaming: false,
        isLoading: true,
        error: null,
        cannotAnswer: false,
      });

      // Second answer should be updated
      expect(finalState.answers[1]).toEqual({
        answer: 'Updated answer',
        prompt: 'Second question',
        citations: [],
        isStreaming: false,
        isLoading: true,
        error: 'Something went wrong',
        cannotAnswer: false,
      });
    });

    it('updates partial properties without overriding others', () => {
      // First, update some properties
      state = multiTurnReducer(
        state,
        updateActiveAnswer({
          answer: 'Partial answer',
          isStreaming: true,
        })
      );

      // Then update different properties
      const finalState = multiTurnReducer(
        state,
        updateActiveAnswer({
          cannotAnswer: true,
          error: 'Error occurred',
        })
      );

      expect(finalState.answers[0]).toEqual({
        answer: 'Partial answer',
        prompt: 'Test question',
        citations: [],
        isStreaming: true,
        isLoading: true,
        error: 'Error occurred',
        cannotAnswer: true,
      });
    });

    it('does nothing when there are no answers', () => {
      const emptyState = getMultiTurnConversationInitialState();
      const updates = {answer: 'This should not be added'};
      const action = updateActiveAnswer(updates);
      const finalState = multiTurnReducer(emptyState, action);

      expect(finalState.answers).toEqual([]);
    });

    it('can update citations array', () => {
      const citation = buildMockCitation({
        id: 'citation-1',
        title: 'Test Citation',
        uri: 'https://example.com',
      });

      const updates = {citations: [citation]};
      const action = updateActiveAnswer(updates);
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers[0].citations).toEqual([citation]);
    });
  });

  describe('#updateCitationsToActiveAnswer', () => {
    beforeEach(() => {
      // Add an answer to work with
      state = multiTurnReducer(state, addAnswer({prompt: 'Test question'}));
    });

    it('adds a citation to the last answer', () => {
      const citation = buildMockCitation({
        id: 'citation-1',
        title: 'Test Citation',
        uri: 'https://example.com',
        text: 'Citation text',
      });
      const action = updateCitationsToActiveAnswer([citation]);
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers[0].citations).toHaveLength(1);
      expect(finalState.answers[0].citations[0]).toEqual(citation);
    });

    it('adds multiple citations in sequence', () => {
      const citation1 = buildMockCitation({
        id: 'citation-1',
        title: 'First Citation',
      });
      const citation2 = buildMockCitation({
        id: 'citation-2',
        title: 'Second Citation',
      });

      let finalState = multiTurnReducer(
        state,
        updateCitationsToActiveAnswer([citation1])
      );
      finalState = multiTurnReducer(
        finalState,
        updateCitationsToActiveAnswer([citation2])
      );

      expect(finalState.answers[0].citations).toHaveLength(2);
      expect(finalState.answers[0].citations[0]).toEqual(citation1);
      expect(finalState.answers[0].citations[1]).toEqual(citation2);
    });

    it('adds citation only to the last answer when there are multiple answers', () => {
      // Add a second answer
      state = multiTurnReducer(state, addAnswer({prompt: 'Second question'}));

      const citation = buildMockCitation({
        id: 'citation-1',
        title: 'Test Citation',
      });
      const action = updateCitationsToActiveAnswer([citation]);
      const finalState = multiTurnReducer(state, action);

      // First answer should have no citations
      expect(finalState.answers[0].citations).toHaveLength(0);
      // Second answer should have the citation
      expect(finalState.answers[1].citations).toHaveLength(1);
      expect(finalState.answers[1].citations[0]).toEqual(citation);
    });

    it('does nothing when there are no answers', () => {
      const emptyState = getMultiTurnConversationInitialState();
      const citation = buildMockCitation({id: 'citation-1'});
      const action = updateCitationsToActiveAnswer([citation]);
      const finalState = multiTurnReducer(emptyState, action);

      expect(finalState.answers).toEqual([]);
    });
  });

  describe('#markActiveAnswerComplete', () => {
    beforeEach(() => {
      // Add an answer and set it to loading/streaming state
      state = multiTurnReducer(state, addAnswer({prompt: 'Test question'}));
      state = multiTurnReducer(
        state,
        updateActiveAnswer({
          answer: 'Complete answer',
          isLoading: true,
          isStreaming: true,
        })
      );
    });

    it('sets isLoading to false for the last answer', () => {
      const action = markActiveAnswerComplete();
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers[0].isLoading).toBe(false);
    });

    it('sets isStreaming to false for the last answer', () => {
      const action = markActiveAnswerComplete();
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers[0].isStreaming).toBe(false);
    });

    it('preserves other properties of the answer', () => {
      const action = markActiveAnswerComplete();
      const finalState = multiTurnReducer(state, action);

      expect(finalState.answers[0]).toEqual({
        answer: 'Complete answer',
        prompt: 'Test question',
        citations: [],
        isStreaming: false,
        isLoading: false,
        error: null,
        cannotAnswer: false,
      });
    });

    it('only affects the last answer when there are multiple answers', () => {
      // Add a second answer
      state = multiTurnReducer(state, addAnswer({prompt: 'Second question'}));
      state = multiTurnReducer(
        state,
        updateActiveAnswer({
          isLoading: true,
          isStreaming: true,
        })
      );

      const action = markActiveAnswerComplete();
      const finalState = multiTurnReducer(state, action);

      // First answer should remain unchanged
      expect(finalState.answers[0].isLoading).toBe(true);
      expect(finalState.answers[0].isStreaming).toBe(true);

      // Second answer should be marked complete
      expect(finalState.answers[1].isLoading).toBe(false);
      expect(finalState.answers[1].isStreaming).toBe(false);
    });

    it('does nothing when there are no answers', () => {
      const emptyState = getMultiTurnConversationInitialState();
      const action = markActiveAnswerComplete();
      const finalState = multiTurnReducer(emptyState, action);

      expect(finalState.answers).toEqual([]);
    });
  });

  describe('state immutability', () => {
    it('does not mutate the original state when adding an answer', () => {
      const originalState = {...state};
      const action = addAnswer({prompt: 'Test question'});
      multiTurnReducer(state, action);

      expect(state).toEqual(originalState);
    });

    it('does not mutate the original state when updating an answer', () => {
      state = multiTurnReducer(state, addAnswer({prompt: 'Test question'}));
      const stateBeforeUpdate = {...state, answers: [...state.answers]};

      const action = updateActiveAnswer({answer: 'Updated answer'});
      multiTurnReducer(state, action);

      expect(state).toEqual(stateBeforeUpdate);
    });

    it('does not mutate the original state when adding citations', () => {
      state = multiTurnReducer(state, addAnswer({prompt: 'Test question'}));
      const stateBeforeUpdate = {
        ...state,
        answers: state.answers.map((answer) => ({
          ...answer,
          citations: [...answer.citations],
        })),
      };
      const citation = buildMockCitation({id: 'citation-1'});
      const action = updateCitationsToActiveAnswer([citation]);
      multiTurnReducer(state, action);

      expect(state).toEqual(stateBeforeUpdate);
    });
  });

  describe('edge cases', () => {
    it('handles actions gracefully on empty conversation', () => {
      const emptyState = getMultiTurnConversationInitialState();

      // These actions should not throw and should not modify the state
      const actions = [
        updateActiveAnswer({answer: 'test'}),
        updateCitationsToActiveAnswer([buildMockCitation()]),
        markActiveAnswerComplete(),
      ];

      actions.forEach((action) => {
        const result = multiTurnReducer(emptyState, action);
        expect(result.answers).toEqual([]);
        expect(result.conversationId).toBe('');
      });
    });

    it('handles negative array indices gracefully', () => {
      // This tests that the reducer correctly uses state.answers.length - 1
      const emptyState = getMultiTurnConversationInitialState();

      // When answers array is empty, length - 1 = -1
      const updateAction = updateActiveAnswer({answer: 'test'});
      const result = multiTurnReducer(emptyState, updateAction);

      expect(result.answers).toEqual([]);
    });
  });
});
