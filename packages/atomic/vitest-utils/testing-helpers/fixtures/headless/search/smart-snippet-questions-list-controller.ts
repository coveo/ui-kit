import type {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless';
import {genericSubscribe} from '../../common/subscribe';

export const buildFakeRelatedQuestion = (
  config: Partial<SmartSnippetRelatedQuestion> = {}
): SmartSnippetRelatedQuestion => ({
  questionAnswerId: 'question-1',
  question: 'What is a smart snippet?',
  answer: 'A smart snippet is a summary of an answer.',
  source: {
    title: 'Coveo Documentation',
    uniqueId: 'doc-1',
    uri: 'https://docs.coveo.com',
    clickUri: 'https://docs.coveo.com',
    raw: {},
  } as SmartSnippetRelatedQuestion['source'],
  expanded: false,
  ...config,
});

export const defaultState = {
  questions: [],
} satisfies SmartSnippetQuestionsListState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  expand: () => {},
  collapse: () => {},
  selectSource: () => {},
  beginDelayedSelectSource: () => {},
  cancelPendingSelectSource: () => {},
  selectInlineLink: () => {},
  beginDelayedSelectInlineLink: () => {},
  cancelPendingSelectInlineLink: () => {},
} satisfies SmartSnippetQuestionsList;

export const buildFakeSmartSnippetQuestionsList = ({
  implementation,
  state,
}: {
  implementation?: Partial<SmartSnippetQuestionsList>;
  state?: Partial<SmartSnippetQuestionsListState>;
} = {}): SmartSnippetQuestionsList => ({
  ...defaultImplementation,
  ...implementation,
  state: {...defaultState, ...(state || {})},
});
