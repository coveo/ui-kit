import {configuration} from '../../../app/common-reducers.js';
import {
  generatedAnswerAnalyticsClient,
  logGeneratedAnswerOpenInlineLink,
} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import type {InlineLink} from '../../../utils/inline-link.js';
import {
  buildInteractiveGeneratedAnswerInlineLinkCore,
  type InteractiveGeneratedAnswerInlineLink,
} from './headless-core-interactive-generated-answer-inline-link.js';

vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);

describe('InteractiveGeneratedAnswerInlineLink', () => {
  let engine: MockedSearchEngine;
  let mockLink: InlineLink;
  let interactiveInlineLink: InteractiveGeneratedAnswerInlineLink;

  function initializeInteractiveGeneratedAnswerInlineLink(
    delay?: number,
    answerId = 'answer-id'
  ) {
    mockLink = {
      linkText: 'Some link',
      linkURL: 'https://example.com/some-link',
    };
    interactiveInlineLink = buildInteractiveGeneratedAnswerInlineLinkCore(
      engine,
      generatedAnswerAnalyticsClient,
      {
        options: {link: mockLink, selectionDelay: delay, answerId},
      }
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    engine = buildMockSearchEngine(createMockState());
    initializeInteractiveGeneratedAnswerInlineLink();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('when calling select(), logs logGeneratedAnswerOpenInlineLink', () => {
    interactiveInlineLink.select();

    expect(logGeneratedAnswerOpenInlineLink).toHaveBeenCalledWith(
      mockLink,
      'answer-id'
    );
  });

  it('when calling select() more than once, logs logGeneratedAnswerOpenInlineLink only once', () => {
    interactiveInlineLink.select();
    interactiveInlineLink.select();

    expect(logGeneratedAnswerOpenInlineLink).toHaveBeenCalledTimes(1);
  });
});
