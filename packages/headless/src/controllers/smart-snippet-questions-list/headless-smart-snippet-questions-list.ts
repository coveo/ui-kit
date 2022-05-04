import {buildController, Controller} from '../controller/headless-controller';
import {search, questionAnswering} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  QuestionAnswer,
  QuestionAnswerDocumentIdentifier,
} from '../../api/search/search/question-answering';
import {
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
} from '../../features/question-answering/question-answering-analytics-actions';
import {QuestionAnsweringSection} from '../../state/state-sections';
import {QuestionAnsweringRelatedQuestionState} from '../../features/question-answering/question-answering-state';
import {findRelatedQuestionIdx} from '../../features/question-answering/question-answering-slice';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../features/question-answering/question-answering-actions';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';

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
   * Expand the specified snippet suggestion.
   *
   * @deprecated - Use expand(identifier: string) instead.
   *
   * @param identifier - The identifier of a document used to create the smart snippet.
   */
  expand(identifier: QuestionAnswerDocumentIdentifier): void;
  /**
   * Collapse the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  collapse(identifier: string): void;
  /**
   * Collapse the specified snippet suggestion.
   *
   * @deprecated - Use collapse(identifier: string) instead.
   *
   * @param identifier - The identifier of a document used to create the smart snippet.
   */
  collapse(identifier: QuestionAnswerDocumentIdentifier): void;
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
   * Determines if the snippet is currently expanded.
   */
  expanded: boolean;
}

/**
 * Creates a `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SmartSnippetQuestionsList` controller instance.
 * */
export function buildSmartSnippetQuestionsList(
  engine: SearchEngine
): SmartSnippetQuestionsList {
  if (!loadSmartSnippetQuestionsListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  const getIsExpanded = (
    questionAndAnswer: QuestionAnswer,
    relatedQuestions: QuestionAnsweringRelatedQuestionState[]
  ) => {
    const idx = findRelatedQuestionIdx(
      relatedQuestions,
      questionAndAnswer.documentId
    );
    if (idx === -1) {
      return false;
    }
    return relatedQuestions[idx].expanded;
  };

  const getPayloadFromIdentifier = (
    identifier: string | QuestionAnswerDocumentIdentifier
  ) =>
    typeof identifier === 'string'
      ? {questionAnswerId: identifier}
      : identifier;

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        questions: state.search.response.questionAnswer.relatedQuestions.map(
          (relatedQuestion) => ({
            question: relatedQuestion.question,
            answer: relatedQuestion.answerSnippet,
            documentId: relatedQuestion.documentId,
            expanded: getIsExpanded(
              relatedQuestion,
              state.questionAnswering.relatedQuestions
            ),
          })
        ),
      };
    },

    expand(identifier) {
      const payload = getPayloadFromIdentifier(identifier);
      engine.dispatch(logExpandSmartSnippetSuggestion(payload));
      engine.dispatch(expandSmartSnippetRelatedQuestion(payload));
    },
    collapse(identifier) {
      const payload = getPayloadFromIdentifier(identifier);
      engine.dispatch(logCollapseSmartSnippetSuggestion(payload));
      engine.dispatch(collapseSmartSnippetRelatedQuestion(payload));
    },
  };
}

function loadSmartSnippetQuestionsListReducer(
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
