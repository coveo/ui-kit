import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {insightSmartSnippetAnalyticsClient} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  buildCoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsList,
  SmartSnippetQuestionsListProps,
  CoreSmartSnippetQuestionsListState,
} from '../../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';
import {InlineLink} from '../../smart-snippet/headless-smart-snippet-interactive-inline-links';
import {buildSmartSnippetInteractiveInlineLinks} from '../smart-snippet/headless-insight-smart-snippet-interactive-inline-links';
import {buildInsightSmartSnippetInteractiveQuestions} from './headless-insight-smart-snippet-interactive-questions';

export type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering';
export type {
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  CoreSmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  CoreSmartSnippetQuestionsList,
} from '../../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list';

/**
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippetQuestionsList` controller.
 */
export interface SmartSnippetQuestionsListState
  extends CoreSmartSnippetQuestionsListState {}

/**
 * The insight `SmartSnippetQuestionsList` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 */
export interface SmartSnippetQuestionsList
  extends CoreSmartSnippetQuestionsList {
  /**
   * The state of the SmartSnippetQuestionsList controller.
   * */
  state: SmartSnippetQuestionsListState;
  /**
   * Selects the source, logging a UA event to the Coveo Platform if the source hadn't been selected before.
   *
   * In a DOM context, we recommend calling this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  selectSource(identifier: string): void;
  /**
   * Prepares to select the source after a certain delay, sending analytics if it hadn't been selected before.
   *
   * In a DOM context, we recommend calling this method on the `touchstart` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  beginDelayedSelectSource(identifier: string): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelect`.
   *
   * In a DOM context, we recommend calling this method on the `touchend` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  cancelPendingSelectSource(identifier: string): void;
  /**
   * Selects a link inside an answer, logging a UA event to the Coveo Platform if it was never selected before.
   *
   * In a DOM context, we recommend calling this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   *
   * @param identifier - The `questionAnswerId` of the smart snippet containing the link.
   * @param link - The link to select.
   */
  selectInlineLink(identifier: string, link: InlineLink): void;
  /**
   * Prepares to select a link inside an answer after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, we recommend calling this method on the `touchstart` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet containing the link.
   * @param link - The link to select.
   */
  beginDelayedSelectInlineLink(identifier: string, link: InlineLink): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelectInlineLink`.
   *
   * In a DOM context, we recommend calling this method on the `touchend` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet containing the link.
   * @param link - The link to select.
   */
  cancelPendingSelectInlineLink(identifier: string, link: InlineLink): void;
}

/**
 * Creates an insight `SmartSnippetQuestionsList` controller instance.
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
