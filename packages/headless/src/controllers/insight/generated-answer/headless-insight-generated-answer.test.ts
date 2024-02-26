import {updateResponseFormat} from '../../../features/generated-answer/generated-answer-actions';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-insight-generated-answer';

jest.mock('../../../features/generated-answer/generated-answer-actions');
jest.mock('../../../features/insight-search/insight-search-actions');

describe('insight generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockedInsightEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildGeneratedAnswer(engine, props);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
    initGeneratedAnswer();
  });

  it('#retry dispatches #executeSearch', () => {
    generatedAnswer.retry();
    expect(executeSearch).toHaveBeenCalled();
  });

  describe('#rephrase', () => {
    const responseFormat: GeneratedResponseFormat = {
      answerStyle: 'concise',
    };

    it('dispatches the update action', () => {
      generatedAnswer.rephrase(responseFormat);

      expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
    });

    it('dispatches #executeSearch', () => {
      generatedAnswer.rephrase(responseFormat);
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
