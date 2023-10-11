import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client';
import {buildMockCitation} from '../../test/mock-citation';
import {
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  resetAnswer,
  setIsVisible,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateError,
  updateMessage,
} from './generated-answer-actions';
import {generatedAnswerReducer} from './generated-answer-slice';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

const baseState = {
  isVisible: true,
  isLoading: false,
  isStreaming: false,
  citations: [],
  liked: false,
  disliked: false,
};

describe('generated answer slice', () => {
  it('initializes the state correctly', () => {
    const finalState = generatedAnswerReducer(undefined, {type: ''});

    expect(finalState).toEqual(baseState);
  });

  describe('#updateMessage', () => {
    it('concatenates the given string with the answer previously in the state', () => {
      const existingAnswer = 'I exist';
      const newMessage = ' therefore I am';
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          answer: existingAnswer,
        },
        updateMessage({
          textDelta: newMessage,
        })
      );

      expect(finalState.answer).toBe('I exist therefore I am');
      expect(finalState.error).toBeUndefined();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isStreaming).toBe(true);
    });
  });

  describe('#updateCitations', () => {
    it('Adds the given citations to the state', () => {
      const newCitations = [buildMockCitation()];
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
        },
        updateCitations({citations: newCitations})
      );

      expect(finalState.citations).toEqual(newCitations);
      expect(finalState.error).toBeUndefined();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isStreaming).toBe(true);
    });

    it('Appends the given citations to existing citations', () => {
      const existingCitations = [buildMockCitation()];
      const newCitations = [
        buildMockCitation({
          id: 'some-other-id',
        }),
      ];
      const finalState = generatedAnswerReducer(
        {
          ...getGeneratedAnswerInitialState(),
          citations: existingCitations,
        },
        updateCitations({citations: newCitations})
      );

      expect(finalState.citations).toEqual([
        ...existingCitations,
        ...newCitations,
      ]);
    });
  });

  describe('#updateError', () => {
    const testPayload = {
      message: 'some error message',
      code: 500,
    };
    it('should set isLoading to false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isLoading: true},
        updateError(testPayload)
      );

      expect(finalState.isLoading).toBe(false);
    });

    it('should set isStreaming to false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isStreaming: true},
        updateError(testPayload)
      );

      expect(finalState.isStreaming).toBe(false);
    });

    it('should delete the answer', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, answer: 'I exist'},
        updateError(testPayload)
      );

      expect(finalState.answer).toBeUndefined();
    });

    it('should set given error values', () => {
      const finalState = generatedAnswerReducer(
        baseState,
        updateError({
          message: 'a message',
          code: 500,
        })
      );

      expect(finalState.error).toEqual({
        message: 'a message',
        code: 500,
        isRetryable: false,
      });
    });

    it('should set retryable to true if the error code matches the retryable error code', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, answer: 'I exist'},
        updateError({
          message: 'a message',
          code: RETRYABLE_STREAM_ERROR_CODE,
        })
      );

      expect(finalState.error).toEqual({
        message: 'a message',
        code: RETRYABLE_STREAM_ERROR_CODE,
        isRetryable: true,
      });
    });

    it('should accept an error payload without a message', () => {
      const testErrorPayload = {
        code: 500,
      };
      const finalState = generatedAnswerReducer(
        getGeneratedAnswerInitialState(),
        updateError(testErrorPayload)
      );

      expect(finalState.error).toEqual({
        ...testErrorPayload,
        isRetryable: false,
      });
    });

    it('should accept an error payload without a code', () => {
      const testErrorPayload = {
        message: 'some message',
      };
      const finalState = generatedAnswerReducer(
        getGeneratedAnswerInitialState(),
        updateError(testErrorPayload)
      );

      expect(finalState.error).toEqual({
        ...testErrorPayload,
        isRetryable: false,
      });
    });
  });

  it('#resetAnswer should reset the state to the initial state', () => {
    const state = {
      ...baseState,
      isStreaming: true,
      isLoading: true,
      answer: 'Tomato Tomato',
      citations: [],
      error: {
        message: 'Execute order',
        error: 66,
      },
    };

    const finalState = generatedAnswerReducer(state, resetAnswer());

    expect(finalState).toEqual(getGeneratedAnswerInitialState());
  });

  it('#likeGeneratedAnswer should set the answer as liked in the state', () => {
    const finalState = generatedAnswerReducer(baseState, likeGeneratedAnswer());

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      liked: true,
      disliked: false,
    });
  });

  it('#dislikeGeneratedAnswer should set the answer as disliked in the state', () => {
    const finalState = generatedAnswerReducer(
      baseState,
      dislikeGeneratedAnswer()
    );

    expect(finalState).toEqual({
      ...getGeneratedAnswerInitialState(),
      liked: false,
      disliked: true,
    });
  });

  describe('#setIsLoading', () => {
    it('should set isLoading to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isLoading: false},
        setIsLoading(true)
      );

      expect(finalState.isLoading).toEqual(true);
    });

    it('should set isLoading to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isLoading: true},
        setIsLoading(false)
      );

      expect(finalState.isLoading).toEqual(false);
    });
  });

  describe('#setIsStreaming', () => {
    it('should set isStreaming to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isStreaming: false},
        setIsStreaming(true)
      );

      expect(finalState.isStreaming).toEqual(true);
    });

    it('should set isStreaming to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isStreaming: true},
        setIsStreaming(false)
      );

      expect(finalState.isStreaming).toEqual(false);
    });
  });

  describe('#setIsVisible', () => {
    it('should set isVisible to true when given true', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isVisible: false},
        setIsVisible(true)
      );

      expect(finalState.isVisible).toEqual(true);
    });

    it('should set isVisible to false when given false', () => {
      const finalState = generatedAnswerReducer(
        {...baseState, isVisible: true},
        setIsVisible(false)
      );

      expect(finalState.isVisible).toEqual(false);
    });
  });
});
