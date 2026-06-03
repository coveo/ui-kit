import type {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const buildFakeRelatedQuestion = (
  config: Partial<SmartSnippetRelatedQuestion> = {}
): SmartSnippetRelatedQuestion => {
  const defaultSource = {
    title: 'Coveo Documentation',
    uniqueId: 'doc-1',
    uri: 'https://docs.coveo.com',
    clickUri: 'https://docs.coveo.com',
    raw: {},
  } as SmartSnippetRelatedQuestion['source'];

  return {
    ...config,
    questionAnswerId: config.questionAnswerId ?? 'question-1',
    question: config.question ?? 'What is a smart snippet?',
    answer: config.answer ?? 'A smart snippet is a summary of an answer.',
    documentId: config.documentId ?? {contentIdKey: '', contentIdValue: ''},
    source: config.source ?? defaultSource,
    expanded: config.expanded ?? false,
  };
};

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
