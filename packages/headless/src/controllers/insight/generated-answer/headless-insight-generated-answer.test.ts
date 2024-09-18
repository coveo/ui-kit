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
});
