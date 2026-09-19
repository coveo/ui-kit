import type {GeneratedAnswerBase} from '@coveo/headless';
import type {i18n} from 'i18next';
import {markdownToPlainText} from './generated-content/markdown-utils';

export interface AnswerAnnouncement {
  message: string;
  assertive: boolean;
}

type AnnounceableAnswer = Pick<
  GeneratedAnswerBase,
  'answer' | 'cannotAnswer' | 'error' | 'isLoading' | 'isStreaming'
>;

const SILENT: AnswerAnnouncement = {message: '', assertive: false};

/**
 * Computes the screen reader announcement describing the state of a single generated answer.
 *
 * The conversational rendering path holds one of these per conversation turn, so each answer
 * reports its own state instead of relying on the top-level answer state.
 */
export const getAnswerAnnouncement = (
  answer: AnnounceableAnswer | undefined,
  i18n: i18n
): AnswerAnnouncement => {
  if (!answer) {
    return SILENT;
  }

  if (answer.error) {
    const errorMessageKey = answer.error.isSseTurnLimitReachedError?.()
      ? 'generated-answer-error-turn-limit-reached'
      : 'generated-answer-error-generic';

    return {message: i18n.t(errorMessageKey), assertive: true};
  }

  if (answer.cannotAnswer) {
    return {
      message: i18n.t('generated-answer-cannot-generate-answer'),
      assertive: true,
    };
  }

  if (answer.isStreaming || answer.isLoading) {
    return {message: i18n.t('generating-answer'), assertive: false};
  }

  if (answer.answer?.trim()) {
    return {
      message: i18n.t('answer-generated', {
        answer: markdownToPlainText(answer.answer),
      }),
      assertive: false,
    };
  }

  return SILENT;
};

/**
 * Whether an answer has finished generating successfully.
 *
 * Used to stay silent when an already-completed answer is rendered for the first time, such as
 * when earlier conversation turns are revealed.
 */
export const isSettledAnswer = (answer: AnnounceableAnswer | undefined): boolean =>
  Boolean(
    answer &&
    !answer.isStreaming &&
    !answer.isLoading &&
    !answer.error &&
    !answer.cannotAnswer &&
    answer.answer?.trim()
  );
