import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-generated-answer';

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockSearchEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildGeneratedAnswer(engine, props);
  }

  function findAction(actionType: string) {
    return engine.actions.find((a) => a.type === actionType);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initGeneratedAnswer();
  });

  it('#retry dispatches #executeSearch', () => {
    generatedAnswer.retry();
    const action = engine.findAsyncAction(executeSearch.pending);

    expect(action).toBeTruthy();
  });

  describe('#rephrase', () => {
    const responseFormat: GeneratedResponseFormat = {
      answerStyle: 'concise',
    };

    it('dispatches the update action', () => {
      generatedAnswer.rephrase(responseFormat);

      const action = findAction(updateResponseFormat.type);
      expect(action).toBeDefined();
      expect(action).toHaveProperty('payload', responseFormat);
    });

    it('dispatches #executeSearch', () => {
      generatedAnswer.rephrase(responseFormat);

      const action = engine.findAsyncAction(executeSearch.pending);

      expect(action).toBeTruthy();
    });
  });
});
