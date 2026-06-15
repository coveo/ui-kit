import type {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';
import {configuration} from '../../../app/common-reducers.js';
import {buildMockCitation} from '../../../test/mock-citation.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildInteractiveCitationCore,
  type InteractiveCitation,
  type InteractiveCitationAnalyticsClient,
} from './headless-core-interactive-citation.js';

describe('InteractiveCitation', () => {
  let engine: MockedSearchEngine;
  let mockCitation: GeneratedAnswerCitation;
  let interactiveCitation: InteractiveCitation;
  let analyticsClient: InteractiveCitationAnalyticsClient;

  function initializeInteractiveCitation(delay?: number, answerId?: string) {
    mockCitation = buildMockCitation({
      id: 'some-test-id',
    });
    analyticsClient = {
      logCitationOpen: vi.fn(),
    };
    interactiveCitation = buildInteractiveCitationCore(
      engine,
      analyticsClient,
      {
        options: {citation: mockCitation, selectionDelay: delay, answerId},
      }
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    engine = buildMockSearchEngine(createMockState());
    initializeInteractiveCitation();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), calls logCitationOpen with citation id', () => {
    interactiveCitation.select();
    expect(analyticsClient.logCitationOpen).toHaveBeenCalledWith(
      mockCitation.id,
      undefined
    );
  });

  it('when an answerId is provided, passes it to logCitationOpen', () => {
    initializeInteractiveCitation(undefined, 'answer-id');

    interactiveCitation.select();

    expect(analyticsClient.logCitationOpen).toHaveBeenCalledWith(
      mockCitation.id,
      'answer-id'
    );
  });

  it('when calling select() more than once, calls logCitationOpen only once', () => {
    interactiveCitation.select();
    interactiveCitation.select();

    expect(analyticsClient.logCitationOpen).toHaveBeenCalledTimes(1);
  });
});
