import type {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';
import {configuration} from '../../../app/common-reducers.js';
import {
  generatedAnswerAnalyticsClient,
  logOpenGeneratedAnswerSource,
} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {buildMockCitation} from '../../../test/mock-citation.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildInteractiveCitationCore,
  type InteractiveCitation,
} from './headless-core-interactive-citation.js';

vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);

describe('InteractiveCitation', () => {
  let engine: MockedSearchEngine;
  let mockCitation: GeneratedAnswerCitation;
  let interactiveCitation: InteractiveCitation;

  function initializeInteractiveCitation(delay?: number) {
    mockCitation = buildMockCitation({
      id: 'some-test-id',
    });
    interactiveCitation = buildInteractiveCitationCore(
      engine,
      generatedAnswerAnalyticsClient,
      {
        options: {citation: mockCitation, selectionDelay: delay},
      }
    );
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    initializeInteractiveCitation();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs openGeneratedAnswerSource', () => {
    interactiveCitation.select();
    expect(logOpenGeneratedAnswerSource).toHaveBeenCalledWith(mockCitation.id);
  });
});
