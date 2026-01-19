import type {SmartSnippet, SmartSnippetState} from '@coveo/headless/insight';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  answerFound: false,
  liked: false,
  disliked: false,
  feedbackModalOpen: false,
  expanded: false,
  question: '',
  answer: '',
  documentId: {
    contentIdKey: '',
    contentIdValue: '',
  },
  source: undefined,
} satisfies SmartSnippetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  expand: vi.fn() as SmartSnippet['expand'],
  collapse: vi.fn() as SmartSnippet['collapse'],
  like: vi.fn() as SmartSnippet['like'],
  dislike: vi.fn() as SmartSnippet['dislike'],
  openFeedbackModal: vi.fn() as SmartSnippet['openFeedbackModal'],
  closeFeedbackModal: vi.fn() as SmartSnippet['closeFeedbackModal'],
  sendFeedback: vi.fn() as SmartSnippet['sendFeedback'],
  sendDetailedFeedback: vi.fn() as SmartSnippet['sendDetailedFeedback'],
  selectSource: vi.fn() as SmartSnippet['selectSource'],
  beginDelayedSelectSource: vi.fn() as SmartSnippet['beginDelayedSelectSource'],
  cancelPendingSelectSource:
    vi.fn() as SmartSnippet['cancelPendingSelectSource'],
  selectInlineLink: vi.fn() as SmartSnippet['selectInlineLink'],
  beginDelayedSelectInlineLink:
    vi.fn() as SmartSnippet['beginDelayedSelectInlineLink'],
  cancelPendingSelectInlineLink:
    vi.fn() as SmartSnippet['cancelPendingSelectInlineLink'],
} satisfies SmartSnippet;

export const buildFakeInsightSmartSnippet = ({
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
