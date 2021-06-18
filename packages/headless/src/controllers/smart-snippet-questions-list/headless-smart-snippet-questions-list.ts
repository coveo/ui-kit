import {buildController, Controller} from '../controller/headless-controller';
import {search, questionAnswering} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  QuestionAnswer,
  QuestionAnswerDocumentIdentifier,
} from '../../api/search/search/question-answering';
export {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
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
   */
  expand(identifier: QuestionAnswerDocumentIdentifier): void;
  /**
   * Collapse the specified snippet suggestion.
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

    expand(documentId: QuestionAnswerDocumentIdentifier) {
      engine.dispatch(logExpandSmartSnippetSuggestion(documentId));
      engine.dispatch(expandSmartSnippetRelatedQuestion(documentId));
    },
    collapse(documentId: QuestionAnswerDocumentIdentifier) {
      engine.dispatch(logCollapseSmartSnippetSuggestion(documentId));
      engine.dispatch(collapseSmartSnippetRelatedQuestion(documentId));
    },
  };
}

function loadSmartSnippetQuestionsListReducer(
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
