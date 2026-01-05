import type {
  QuestionAnswerDocumentIdentifier,
  SmartSnippet,
  SmartSnippetState,
} from '@coveo/headless/insight';
import {genericSubscribe} from '../common';

export const defaultState = {
  question: 'What is a smart snippet?',
  answer:
    'A smart snippet is an automatically generated answer extracted from a relevant document.',
  documentId: {
    contentIdKey: 'permanentid',
    contentIdValue: 'test-document-id',
  } as QuestionAnswerDocumentIdentifier,
  source: {
    title: 'Test Document',
    uri: 'https://example.com/doc',
    permanentid: 'test-document-id',
    clickUri: 'https://example.com/doc',
    uniqueId: 'test-unique-id',
  } as SmartSnippetState['source'],
  answerFound: true,
  liked: false,
  disliked: false,
  feedbackModalOpen: false,
  expanded: false,
} satisfies SmartSnippetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  like: () => {},
  dislike: () => {},
  openFeedbackModal: () => {},
  closeFeedbackModal: () => {},
  sendFeedback: () => {},
  sendDetailedFeedback: () => {},
  expand: () => {},
  collapse: () => {},
  selectSource: () => {},
  beginDelayedSelectSource: () => {},
  cancelPendingSelectSource: () => {},
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
