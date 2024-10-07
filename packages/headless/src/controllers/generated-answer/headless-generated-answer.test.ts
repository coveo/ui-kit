import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions.js';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildGeneratedAnswer,
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from './headless-generated-answer.js';

vi.mock('../../features/generated-answer/generated-answer-actions');
vi.mock('../../features/search/search-actions');

describe('generated answer', () => {
  let engine: MockedSearchEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    buildGeneratedAnswer(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it('initialize the format', () => {
    const responseFormat: GeneratedResponseFormat = {
      contentFormat: ['text/markdown'],
    };
    initGeneratedAnswer({
      initialState: {responseFormat},
    });

    expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
  });
});
