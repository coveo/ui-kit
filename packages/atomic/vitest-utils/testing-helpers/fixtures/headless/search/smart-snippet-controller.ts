import type {SmartSnippet} from '@coveo/headless';
import {vi} from 'vitest';

export function buildFakeSmartSnippet(
  config: Partial<SmartSnippet> = {}
): SmartSnippet {
  return {
    state: {
      answerFound: false,
      liked: false,
      disliked: false,
      feedbackModalOpen: false,
      question: '',
      answer: null,
      documentId: {
        contentIdKey: '',
        contentIdValue: '',
      },
      source: null,
      relatedQuestions: [],
    },
    ...config,
    subscribe: config.subscribe ?? vi.fn(),
    openFeedbackModal: config.openFeedbackModal ?? vi.fn(),
    closeFeedbackModal: config.closeFeedbackModal ?? vi.fn(),
    sendFeedback: config.sendFeedback ?? vi.fn(),
    sendDetailedFeedback: config.sendDetailedFeedback ?? vi.fn(),
    like: config.like ?? vi.fn(),
    dislike: config.dislike ?? vi.fn(),
  } as SmartSnippet;
}
