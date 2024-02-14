import {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload';
import {configuration} from '../../../app/common-reducers';
import {
  generatedAnswerAnalyticsClient,
  logOpenGeneratedAnswerSource,
} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {buildMockCitation} from '../../../test/mock-citation';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  buildInteractiveCitationCore,
  InteractiveCitation,
} from './headless-core-interactive-citation';

jest.mock(
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
