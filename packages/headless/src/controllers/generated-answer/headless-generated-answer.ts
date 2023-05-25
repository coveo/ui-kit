import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  sseMessage,
  sseError,
  sseComplete,
  resetAnswer,
} from '../../features/generated-answer/generated-answer-actions';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';

export type {GeneratedAnswerState};

/**
 * Creates a `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 * */
export function buildGeneratedAnswer(engine: SearchEngine): GeneratedAnswer {
  const {dispatch} = engine;
  const state = engine.state;

  return {
    get state() {
      return state.generatedAnswer;
    },

    selectPage(page: number) {
      generatedanswer.selectPage(page);
      dispatch(fetchPage(logPageNumber()));
    },

    nextPage() {
      generatedanswer.nextPage();
      dispatch(fetchPage(logPageNext()));
    },

    previousPage() {
      generatedanswer.previousPage();
      dispatch(fetchPage(logPagePrevious()));
    },
  };
}
