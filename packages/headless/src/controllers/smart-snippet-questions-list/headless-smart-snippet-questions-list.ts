import {SearchEngine} from '../../app/search-engine/search-engine';
import {insightSmartSnippetAnalyticsClient} from '../../features/question-answering/question-answering-insight-analytics-actions';
import {
  buildCoreSmartSnippetQuestionsList,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';
import {buildSmartSnippetInteractiveInlineLinks} from '../smart-snippet/headless-smart-snippet-interactive-inline-links';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
export type {
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListCore,
} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';

/**
 * Creates a `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippetQuestionsList` properties.
 * @returns A `SmartSnippetQuestionsList` controller instance.
 * */
export function buildSmartSnippetQuestionsList(
  engine: SearchEngine,
  props?: SmartSnippetQuestionsListProps
): SmartSnippetQuestionsList {
  const smartSnippetQuestionList = buildCoreSmartSnippetQuestionsList(
    engine,
    insightSmartSnippetAnalyticsClient,
    props
  );

  const interactiveInlineLinks = buildSmartSnippetInteractiveInlineLinks(
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
