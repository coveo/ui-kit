import type {SmartSnippetFeedback} from '@coveo/headless';

export const feedbackOptions: {
  id: string;
  localeKey: string;
  correspondingAnswer: SmartSnippetFeedback | 'other';
}[] = [
  {
    id: 'does-not-answer',
    localeKey: 'smart-snippet-feedback-reason-does-not-answer',
    correspondingAnswer: 'does_not_answer',
  },
  {
    id: 'partially-answers',
    localeKey: 'smart-snippet-feedback-reason-partially-answers',
    correspondingAnswer: 'partially_answers',
  },
  {
    id: 'was-not-a-question',
    localeKey: 'smart-snippet-feedback-reason-was-not-a-question',
    correspondingAnswer: 'was_not_a_question',
  },
  {
    id: 'other',
    localeKey: 'smart-snippet-feedback-reason-other',
    correspondingAnswer: 'other',
  },
];
