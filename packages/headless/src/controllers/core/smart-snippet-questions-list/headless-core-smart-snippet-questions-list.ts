import {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering';
import {Result} from '../../../api/search/search/result';
import {CoreEngine} from '../../../app/engine';
import {search, questionAnswering} from '../../../app/reducers';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../../features/question-answering/question-answering-actions';
import {getResultProperty} from '../../../features/result-templates/result-templates-helpers';
import {
  QuestionAnsweringSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering';

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
export interface SmartSnippetQuestionsListCore extends Controller {
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
}

export interface InlineLink {
  linkText: string;
  linkURL: string;
}

/**
 * The `SmartSnippetQuestionsList` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 */
export interface SmartSnippetQuestionsList
  extends SmartSnippetQuestionsListCore {
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
export function buildCoreSmartSnippetQuestionsList(
  engine: CoreEngine
): SmartSnippetQuestionsListCore {
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
      engine.dispatch(expandSmartSnippetRelatedQuestion(payload));
    },

    collapse(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(collapseSmartSnippetRelatedQuestion(payload));
    },
  };
}

function loadSmartSnippetQuestionsListReducer(
  engine: CoreEngine
): engine is CoreEngine<QuestionAnsweringSection & SearchSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
