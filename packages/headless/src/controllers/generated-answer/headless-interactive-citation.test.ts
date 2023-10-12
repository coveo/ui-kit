import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';
import {configuration} from '../../app/common-reducers.js';
import {logOpenGeneratedAnswerSource} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {buildMockCitation} from '../../test/mock-citation.js';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine.js';
import {
  buildInteractiveCitation,
  InteractiveCitation,
} from './headless-interactive-citation.js';

describe('InteractiveCitation', () => {
  let engine: MockSearchEngine;
  let mockCitation: GeneratedAnswerCitation;
  let interactiveCitation: InteractiveCitation;
  let logCitationOpenPendingActionType: string;

  function initializeInteractiveCitation(delay?: number) {
    mockCitation = buildMockCitation({
      id: 'some-test-id',
    });
    logCitationOpenPendingActionType = logOpenGeneratedAnswerSource(
      mockCitation.id
    ).pending.type;
    interactiveCitation = buildInteractiveCitation(engine, {
      options: {citation: mockCitation, selectionDelay: delay},
    });
  }

  function findLogDocumentAction() {
    return (
      engine.actions.find(
        (action) => action.type === logCitationOpenPendingActionType
      ) ?? null
    );
  }

  function expectLogActionPending() {
    const action = findLogDocumentAction();
    expect(action).toEqual(
      logOpenGeneratedAnswerSource(mockCitation.id).pending(
        action!.meta.requestId
      )
    );
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initializeInteractiveCitation();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs openGeneratedAnswerSource', () => {
    interactiveCitation.select();
    expectLogActionPending();
  });
});
