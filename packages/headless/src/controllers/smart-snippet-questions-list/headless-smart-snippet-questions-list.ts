import {buildController, Controller} from '../controller/headless-controller';
import {search, questionAnswering} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
  logShowMoreSmartSnippetSuggestion,
  logShowLessSmartSnippetSuggestion,
} from '../../features/question-answering/question-answering-analytics-actions';
import {QuestionAnsweringSection} from '../../state/state-sections';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
  showMoreSmartSnippetRelatedQuestion,
  showLessSmartSnippetRelatedQuestion,
} from '../../features/question-answering/question-answering-actions';
import {Result} from '../../api/search/search/result';
import {getResultProperty} from '../../features/result-templates/result-templates-helpers';

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
   * Expands the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to expand.
   */
  expand(identifier: string): void;
  /**
   * Expands the specified snippet suggestion.
   *
   * @deprecated - Use expand(identifier: string) instead.
   *
   * @param identifier - The identifier of a document used to create the smart snippet.
   */
  expand(identifier: QuestionAnswerDocumentIdentifier): void;
  /**
   * Collapses the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to collapse.
   */
  collapse(identifier: string): void;
  /**
   * Collapses the specified snippet suggestion.
   *
   * @deprecated - Use collapse(identifier: string) instead.
   *
   * @param identifier - The identifier of a document used to create the smart snippet.
   */
  collapse(identifier: QuestionAnswerDocumentIdentifier): void;
  /**
   * Shows more of the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to expand.
   */
  showMore(identifier: string): void;
  /**
   * Shows less of the specified snippet suggestion.
   *
   * @param identifier - The `questionAnswerId` of the smart snippet to truncate.
   */
  showLess(identifier: string): void;
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
   *
   * This is toggled with `expand` and `collapse`.
   */
  expanded: boolean;
  /**
   * Whether the full answer snippet should be displayed.
   *
   * This is toggled with `showMore` and `showLess`.
   */
  showFullSnippet: boolean;
  /**
   * Provides the source of the smart snippet.
   */
  source?: Result;
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

  const getResult = (identifier: QuestionAnswerDocumentIdentifier) => {
    const {contentIdKey, contentIdValue} = identifier;
    return engine.state.search.results.find(
      (result) => getResultProperty(result, contentIdKey) === contentIdValue
    );
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
          (relatedQuestion, i) => ({
            question: relatedQuestion.question,
            answer: relatedQuestion.answerSnippet,
            documentId: relatedQuestion.documentId,
            questionAnswerId:
              state.questionAnswering.relatedQuestions[i].questionAnswerId,
            expanded: state.questionAnswering.relatedQuestions[i].expanded,
            showFullSnippet:
              state.questionAnswering.relatedQuestions[i].showFullSnippet,
            source: getResult(relatedQuestion.documentId),
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
    showMore(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(logShowMoreSmartSnippetSuggestion(payload));
      engine.dispatch(showMoreSmartSnippetRelatedQuestion(payload));
    },
    showLess(identifier) {
      const payload = {questionAnswerId: identifier};
      engine.dispatch(logShowLessSmartSnippetSuggestion(payload));
      engine.dispatch(showLessSmartSnippetRelatedQuestion(payload));
    },
  };
}

function loadSmartSnippetQuestionsListReducer(
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
