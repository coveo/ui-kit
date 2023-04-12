import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
} from '../../features/question-answering/question-answering-analytics-actions';
import {
  buildCoreSmartSnippetQuestionsList,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';
import {buildSmartSnippetInteractiveInlineLinks} from '../smart-snippet/headless-smart-snippet-interactive-inline-links';
import {buildSmartSnippetInteractiveQuestions} from './headless-smart-snippet-interactive-questions';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
export type {
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  SmartSnippetQuestionsList,
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
  const smartSnippetQuestionList = buildCoreSmartSnippetQuestionsList(engine);

  const interactiveQuestions = buildSmartSnippetInteractiveQuestions(engine, {
    options: {selectionDelay: props?.options?.selectionDelay},
  });

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

    expand(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(logExpandSmartSnippetSuggestion(payload));
      smartSnippetQuestionList.expand(identifier);
    },
    collapse(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(logCollapseSmartSnippetSuggestion(payload));
      smartSnippetQuestionList.collapse(identifier);
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
