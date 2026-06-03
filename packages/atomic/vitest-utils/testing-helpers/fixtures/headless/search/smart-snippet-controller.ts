import type {SmartSnippet, SmartSnippetState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  question: '',
  answer: '',
  documentId: {
    contentIdKey: '',
    contentIdValue: '',
  },
  expanded: false,
  answerFound: false,
  liked: false,
  disliked: false,
  feedbackModalOpen: false,
  source: undefined,
} satisfies SmartSnippetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  expand: vi.fn() as () => void,
  collapse: vi.fn() as () => void,
  like: vi.fn() as () => void,
  dislike: vi.fn() as () => void,
  openFeedbackModal: vi.fn() as () => void,
  closeFeedbackModal: vi.fn() as () => void,
  sendFeedback: vi.fn() as SmartSnippet['sendFeedback'],
  sendDetailedFeedback: vi.fn() as SmartSnippet['sendDetailedFeedback'],
  selectSource: vi.fn() as () => void,
  beginDelayedSelectSource: vi.fn() as () => void,
  cancelPendingSelectSource: vi.fn() as () => void,
  selectInlineLink: vi.fn() as SmartSnippet['selectInlineLink'],
  beginDelayedSelectInlineLink:
    vi.fn() as SmartSnippet['beginDelayedSelectInlineLink'],
  cancelPendingSelectInlineLink:
    vi.fn() as SmartSnippet['cancelPendingSelectInlineLink'],
} satisfies SmartSnippet;

export const buildFakeSmartSnippet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<SmartSnippet>;
  state?: Partial<SmartSnippetState>;
}> = {}): SmartSnippet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as SmartSnippet;
