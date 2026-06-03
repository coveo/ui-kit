import type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering.js';
import type {Result} from '../../../api/search/search/result.js';
import type {CoreEngine} from '../../../app/engine.js';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../../features/question-answering/question-answering-actions.js';
import {questionAnsweringReducer as questionAnswering} from '../../../features/question-answering/question-answering-slice.js';
import {getResultProperty} from '../../../features/result-templates/result-templates-helpers.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  QuestionAnsweringSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {SmartSnippetAnalyticsClient} from '../smart-snippet/headless-core-smart-snippet.js';

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
 * The `CoreSmartSnippetQuestionsList` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 */
export interface CoreSmartSnippetQuestionsList extends Controller {
  /**
   * The state of the SmartSnippetQuestionsList controller.
   * */
  state: CoreSmartSnippetQuestionsListState;
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

/**
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippetQuestionsList` controller.
 */
export interface CoreSmartSnippetQuestionsListState {
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
   * The unique identifier for this question and answer.
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
 * Creates a core `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @param analyticsClient - A SmartSnippetAnalyticsClient to send the appropriate analytics calls.
 * @returns A `CoreSmartSnippetQuestionsList` controller instance.
 * */
export function buildCoreSmartSnippetQuestionsList(
  engine: CoreEngine,
  analyticsClient: SmartSnippetAnalyticsClient
): CoreSmartSnippetQuestionsList {
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
      engine.dispatch(analyticsClient.logExpandSmartSnippetSuggestion(payload));
      engine.dispatch(expandSmartSnippetRelatedQuestion(payload));
    },
    collapse(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(
        analyticsClient.logCollapseSmartSnippetSuggestion(payload)
      );
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
