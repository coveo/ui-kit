import type {
  GeneratedAnswer,
  GeneratedAnswerState,
} from '@coveo/headless/insight';
import {vi} from 'vitest';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';

export const buildFakeGeneratedAnswer = (
  options: Partial<GeneratedAnswerState> = {}
): GeneratedAnswer => {
  const defaultState: GeneratedAnswerState = {
    id: 'test-generated-answer-id',
    isVisible: true,
    isStreaming: false,
    isLoading: false,
    isEnabled: true,
    answer: undefined,
    citations: [],
    answerContentFormat: 'text/plain',
    liked: false,
    disliked: false,
    responseFormat: {contentFormat: ['text/plain']},
    feedbackModalOpen: false,
    feedbackSubmitted: false,
    fieldsToIncludeInCitations: [],
    isAnswerGenerated: false,
    expanded: true,
    cannotAnswer: false,
    answerGenerationMode: 'automatic',
    ...options,
  };

  return {
    state: defaultState,
    subscribe: genericSubscribe,
    show: vi.fn(),
    hide: vi.fn(),
    like: vi.fn(),
    dislike: vi.fn(),
    retry: vi.fn(),
    expand: vi.fn(),
    collapse: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    logCopyToClipboard: vi.fn(),
    logCitationHover: vi.fn(),
    sendFeedback: vi.fn(),
    sendDetailedFeedback: vi.fn(),
    rephrase: vi.fn(),
    openFeedbackModal: vi.fn(),
    closeFeedbackModal: vi.fn(),
  } as unknown as GeneratedAnswer;
};
