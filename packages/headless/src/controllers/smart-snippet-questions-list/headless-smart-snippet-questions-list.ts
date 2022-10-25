import {buildController, Controller} from '../controller/headless-controller';
import {search, questionAnswering} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
} from '../../features/question-answering/question-answering-analytics-actions';
import {QuestionAnsweringSection} from '../../state/state-sections';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../features/question-answering/question-answering-actions';
import {Result} from '../../api/search/search/result';
import {getResultProperty} from '../../features/result-templates/result-templates-helpers';
import {buildSmartSnippetInteractiveQuestions} from './headless-smart-snippet-interactive-questions';
import {
  buildSmartSnippetInteractiveInlineLinks,
  InlineLink,
} from '../smart-snippet/headless-smart-snippet-interactive-inline-links';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';

export interface SmartSnippetQuestionsListOptions {
  /**
   * The amount of time in milliseconds to wait before selecting the source after calling `beginDelayedSelect`.
   *
   * @defaultValue `1000`
   */
  selectionDelay?: number;
}

export interface SmartSnippetQuestionsListProps {
  /**
   * The options for the `SmartSnippetQuestionsList` controller.
   */
  options?: SmartSnippetQuestionsListOptions;
}

/**
 * The `SmartSnippetQuestionsList` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 */
export interface SmartSnippetQuestionsList extends Controller {
  /**
   * The state of the SmartSnippetQuestionsList controller.
   * */
  state: SmartSnippetQuestionsListState;
  /**
   * Expand the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to expand.
   */
  expand(identifier: string): void;
  /**
   * Collapse the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  collapse(identifier: string): void;
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
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippetQuestionsList` controller.
 */
export interface SmartSnippetQuestionsListState {
  /**
   * The related questions for the current query
   */
  questions: SmartSnippetRelatedQuestion[];
}

/**
 * The related questions for a given smart snippet.
 */
export interface SmartSnippetRelatedQuestion {
  /**
   * The question related to the smart snippet.
   */
  question: string;
  /**
   * The answer, or snippet, related to the question.
   *
   * This can contain HTML markup, depending on the source of the answer.
   */
  answer: string;
  /**
   * The index identifier for the document that provided the answer.
   */
  documentId: QuestionAnswerDocumentIdentifier;
  /**
   * The unique identifier for this question & answer.
   */
  questionAnswerId: string;
  /**
   * Determines if the snippet is currently expanded.
   */
  expanded: boolean;
  /**
   * Provides the source of the smart snippet.
   */
  source?: Result;
}

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
  if (!loadSmartSnippetQuestionsListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  const getResult = (identifier: QuestionAnswerDocumentIdentifier) => {
    const {contentIdKey, contentIdValue} = identifier;
    return engine.state.search.results.find(
      (result) => getResultProperty(result, contentIdKey) === contentIdValue
    );
  };

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
    ...controller,

    get state() {
      const state = getState();

      return {
        questions: state.search.questionAnswer.relatedQuestions.map(
          (relatedQuestion, i) => ({
            question: relatedQuestion.question,
            answer: relatedQuestion.answerSnippet,
            documentId: relatedQuestion.documentId,
            questionAnswerId:
              state.questionAnswering.relatedQuestions[i].questionAnswerId,
            expanded: state.questionAnswering.relatedQuestions[i].expanded,
            source: getResult(relatedQuestion.documentId),
          })
        ),
      };
    },

    expand(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(logExpandSmartSnippetSuggestion(payload));
      engine.dispatch(expandSmartSnippetRelatedQuestion(payload));
    },
    collapse(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(logCollapseSmartSnippetSuggestion(payload));
      engine.dispatch(collapseSmartSnippetRelatedQuestion(payload));
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

function loadSmartSnippetQuestionsListReducer(
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
