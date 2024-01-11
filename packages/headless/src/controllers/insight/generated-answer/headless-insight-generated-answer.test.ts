import {updateResponseFormat} from '../../../features/generated-answer/generated-answer-actions';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-insight-generated-answer';

describe('insight generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockInsightEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildGeneratedAnswer(engine, props);
  }

  function findAction(actionType: string) {
    return engine.actions.find((a) => a.type === actionType);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
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
