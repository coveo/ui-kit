import {
  resetAnswer,
  updateError,
  updateMessage,
} from './generated-answer-actions';
import {generatedAnswerReducer} from './generated-answer-slice';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

const baseState = {
  isLoading: false,
  citations: [],
};

describe('generated answer slice', () => {
  it('initializes the state correctly', () => {
    const finalState = generatedAnswerReducer(undefined, {type: ''});

    expect(finalState).toEqual({
      citations: [],
      isLoading: false,
    });
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
    });
  });

  describe('#sseError', () => {
    const testPayload = {
      message: 'some error message',
      code: 500,
    };
    it('should set isLoading to false', () => {
      const finalState = generatedAnswerReducer(
        {isLoading: true, citations: []},
        updateError(testPayload)
      );

      expect(finalState.isLoading).toBe(false);
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
        {...baseState, answer: 'I exist'},
        updateError({
          message: 'a message',
          code: 500,
        })
      );

      expect(finalState.error).toEqual({
        message: 'a message',
        code: 500,
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

      expect(finalState.error).toEqual(testErrorPayload);
    });

    it('should accept an error payload without a code', () => {
      const testErrorPayload = {
        message: 'some message',
      };
      const finalState = generatedAnswerReducer(
        getGeneratedAnswerInitialState(),
        updateError(testErrorPayload)
      );

      expect(finalState.error).toEqual(testErrorPayload);
    });
  });

  it('#resetAnswer should reset the state to the initial state', () => {
    const state = {
      ...baseState,
      isLoading: true,
      answer: 'Tomato Tomato',
    };

    const finalState = generatedAnswerReducer(state, resetAnswer());

    expect(finalState).toEqual(getGeneratedAnswerInitialState());
  });
});
