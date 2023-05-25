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
      retryCount: 0,
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
    it('should increment the retry counter', () => {
      const finalState = generatedAnswerReducer(
        getGeneratedAnswerInitialState(),
        sseError()
      );

      expect(finalState.retryCount).toBe(1);
    });
  });

  describe('#sseComplete', () => {
    it('should reset the retry counter', () => {
      const finalState = generatedAnswerReducer(
        {isLoading: false, retryCount: 1},
        sseComplete()
      );

      expect(finalState.retryCount).toBe(0);
    });
  });

  it('#resetAnswer should reset the state to the initial state', () => {
    const state = {
      isLoading: true,
      answer: 'Tomato Tomato',
      retryCount: 2,
      steamKey: 'this-is-a-stream-key',
    };

    const finalState = generatedAnswerReducer(state, resetAnswer());

    expect(finalState).toEqual(getGeneratedAnswerInitialState());
  });
});
