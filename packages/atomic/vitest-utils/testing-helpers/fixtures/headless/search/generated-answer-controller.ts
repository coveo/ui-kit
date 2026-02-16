import type {GeneratedAnswer, GeneratedAnswerState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';

export const buildFakeGeneratedAnswer = (
  options: Partial<GeneratedAnswerState> = {}
): GeneratedAnswer => {
  const defaultState: GeneratedAnswerState = {
    isVisible: true,
    isStreaming: false,
    isLoading: false,
    answer: undefined,
    citations: [],
    answerContentFormat: 'text/plain',
    liked: false,
    disliked: false,
    feedbackSubmitted: false,
    error: undefined,
    expanded: true,
    cannotAnswer: false,
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
