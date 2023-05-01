import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {insightSmartSnippetAnalyticsClient} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  buildCoreSmartSnippetQuestionsList,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
} from '../../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';
import {buildSmartSnippetInteractiveInlineLinks} from '../smart-snippet/headless-insight-smart-snippet-interactive-inline-links';
import {buildInsightSmartSnippetInteractiveQuestions} from './headless-insight-smart-snippet-interactive-questions';

export type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering';
export type {
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListCore,
} from '../../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';

/**
 * Creates a `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippetQuestionsList` properties.
 * @returns A `SmartSnippetQuestionsList` controller instance.
 * */
export function buildSmartSnippetQuestionsList(
  engine: InsightEngine,
  props?: SmartSnippetQuestionsListProps
): SmartSnippetQuestionsList {
  const smartSnippetQuestionList = buildCoreSmartSnippetQuestionsList(
    engine,
    insightSmartSnippetAnalyticsClient
  );

  const interactiveInlineLinks = buildSmartSnippetInteractiveInlineLinks(
    engine,
    {
      options: {selectionDelay: props?.options?.selectionDelay},
    }
  );

  const interactiveQuestions = buildInsightSmartSnippetInteractiveQuestions(
    engine,
    {
      options: {selectionDelay: props?.options?.selectionDelay},
    }
  );

  return {
    ...smartSnippetQuestionList,

    get state() {
      return smartSnippetQuestionList.state;
    },

    selectSource(identifier) {
      interactiveQuestions.selectSource(identifier);
    },
    beginDelayedSelectSource(identifier) {
      interactiveQuestions.beginDelayedSelectSource(identifier);
    },
    cancelPendingSelectSource(identifier) {
      interactiveQuestions.cancelPendingSelectSource(identifier);
    },
    selectInlineLink(identifier, link) {
      interactiveInlineLinks.selectInlineLink(link, identifier);
    },
    beginDelayedSelectInlineLink(identifier, link) {
      interactiveInlineLinks.beginDelayedSelectInlineLink(link, identifier);
    },
    cancelPendingSelectInlineLink(identifier, link) {
      interactiveInlineLinks.cancelPendingSelectInlineLink(link, identifier);
    },
  };
}
