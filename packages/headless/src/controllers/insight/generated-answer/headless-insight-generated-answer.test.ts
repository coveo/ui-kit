import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-insight-generated-answer.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock('../../../features/insight-search/insight-search-actions');

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
