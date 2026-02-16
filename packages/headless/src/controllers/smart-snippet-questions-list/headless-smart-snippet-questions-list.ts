import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../app/engine.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {smartSnippetAnalyticsClient} from '../../features/question-answering/question-answering-analytics-actions.js';
import {
  buildCoreSmartSnippetQuestionsList,
  type CoreSmartSnippetQuestionsList,
  type CoreSmartSnippetQuestionsListState,
  type SmartSnippetQuestionsListProps,
} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list.js';
import {
  buildSmartSnippetInteractiveInlineLinks,
  type InlineLink,
} from '../smart-snippet/headless-smart-snippet-interactive-inline-links.js';
import {buildSmartSnippetInteractiveQuestions} from './headless-smart-snippet-interactive-questions.js';

export type {
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetRelatedQuestion,
} from '../core/smart-snippet-questions-list/headless-core-smart-snippet-questions-list.js';

/**
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippetQuestionsList` controller.
 *
 * @group Controllers
 * @category SmartSnippetQuestionsList
 */
export interface SmartSnippetQuestionsListState
  extends CoreSmartSnippetQuestionsListState {}

/**
 * The `SmartSnippetQuestionsList` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 *
 * Example: [smart-snippet-questions-list.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/smart-snippet-questions-list/smart-snippet-questions-list.fn.tsx)
 *
 * @group Controllers
 * @category SmartSnippetQuestionsList
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
   * In a DOM context, call this method on all of the following events:
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
   * In a DOM context, call this method on the `touchstart` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  beginDelayedSelectSource(identifier: string): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelect`.
   *
   * In a DOM context, call this method on the `touchend` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  cancelPendingSelectSource(identifier: string): void;
  /**
   * Selects a link inside an answer, logging a UA event to the Coveo Platform if it was never selected before.
   *
   * In a DOM context, call this method on all of the following events:
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
   * In a DOM context, call this method on the `touchstart` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet containing the link.
   * @param link - The link to select.
   */
  beginDelayedSelectInlineLink(identifier: string, link: InlineLink): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelectInlineLink`.
   *
   * In a DOM context, call this method on the `touchend` event.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet containing the link.
   * @param link - The link to select.
   */
  cancelPendingSelectInlineLink(identifier: string, link: InlineLink): void;
}

/**
 * Creates a `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippetQuestionsList` properties.
 * @returns A `SmartSnippetQuestionsList` controller instance.
 *
 * @group Controllers
 * @category SmartSnippetQuestionsList
 * */
export function buildSmartSnippetQuestionsList(
  engine: SearchEngine,
  props?: SmartSnippetQuestionsListProps
): SmartSnippetQuestionsList {
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );
  const smartSnippetQuestionList = buildCoreSmartSnippetQuestionsList(
    engine,
    smartSnippetAnalyticsClient
  );

  const interactiveInlineLinks = buildSmartSnippetInteractiveInlineLinks(
    engine,
    {
      options: {selectionDelay: props?.options?.selectionDelay},
    }
  );

  const interactiveQuestions = buildSmartSnippetInteractiveQuestions(engine, {
    options: {selectionDelay: props?.options?.selectionDelay},
  });

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
