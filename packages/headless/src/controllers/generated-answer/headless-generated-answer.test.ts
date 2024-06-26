/* eslint-disable @typescript-eslint/no-explicit-any */
import {SearchEngine} from '../../app/search-engine/search-engine';
import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {KnowledgeEngine} from '../knowledge/generatedAnswer/headless-knowledge-generated-answer';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-generated-answer';

jest.mock('../../features/generated-answer/generated-answer-actions');
jest.mock('../../features/search/search-actions');

type EngineRequiredByGeneratedAnswer = SearchEngine & KnowledgeEngine;

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockedSearchEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildGeneratedAnswer(
      engine as unknown as EngineRequiredByGeneratedAnswer, // TODO: types
      props
    );
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
