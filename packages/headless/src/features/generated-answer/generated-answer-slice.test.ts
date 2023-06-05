import {
  resetAnswer,
  sseComplete,
  sseError,
  sseMessage,
} from './generated-answer-actions';
import {generatedAnswerReducer} from './generated-answer-slice';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

describe('generated answer slice', () => {
  it('initializes the state correctly', () => {
    const finalState = generatedAnswerReducer(undefined, {type: ''});

    expect(finalState).toEqual({
      isLoading: false,
    });
  });

  it('#sseMessage concatenates the given string with the answer previously in the state', () => {
    const exisitingAnswer = 'I exist';
    const newMessage = ' therefore I am';
    const finalState = generatedAnswerReducer(
      {
        ...getGeneratedAnswerInitialState(),
        answer: exisitingAnswer,
      },
      sseMessage(newMessage)
    );

    expect(finalState.answer).toBe('I exist therefore I am');
  });

  describe('#sseError', () => {
    it('should set isLoading to false', () => {
      const finalState = generatedAnswerReducer({isLoading: true}, sseError());

      expect(finalState.isLoading).toBe(false);
    });

    it('should delete the answer', () => {
      const finalState = generatedAnswerReducer(
        {isLoading: false, answer: 'I exist'},
        sseError()
      );

      expect(finalState.answer).toBeUndefined();
    });

    it('should set given error values', () => {
      const finalState = generatedAnswerReducer(
        {isLoading: false, answer: 'I exist'},
        sseError({
          message: 'a message',
          code: 500,
        })
      );

      expect(finalState.error).toEqual({
        message: 'a message',
        code: 500,
      });
    });
  });

  describe('#sseComplete', () => {
    it('should set isLoading to false', () => {
      const finalState = generatedAnswerReducer(
        {isLoading: true},
        sseComplete()
      );

      expect(finalState.isLoading).toBe(false);
    });
  });

  it('#resetAnswer should reset the state to the initial state', () => {
    const state = {
      isLoading: true,
      answer: 'Tomato Tomato',
    };

    const finalState = generatedAnswerReducer(state, resetAnswer());

    expect(finalState).toEqual(getGeneratedAnswerInitialState());
  });
});
