import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {
  buildGeneratedAnswer,
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from './headless-generated-answer';

jest.mock('../../features/generated-answer/generated-answer-actions');
jest.mock('../../features/search/search-actions');

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
