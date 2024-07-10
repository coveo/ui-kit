import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-generated-answer';

jest.mock('../../features/generated-answer/generated-answer-actions');
jest.mock('../../features/search/search-actions');

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockedSearchEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildGeneratedAnswer(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    initGeneratedAnswer();
  });

  describe('#rephrase', () => {
    const responseFormat: GeneratedResponseFormat = {
      answerStyle: 'concise',
    };

    it('dispatches the update action', () => {
      generatedAnswer.rephrase(responseFormat);
      expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
    });
  });
});
