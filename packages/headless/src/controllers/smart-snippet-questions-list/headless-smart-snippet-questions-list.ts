import {buildController, Controller} from '../controller/headless-controller';
import {search, questionAnswering} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
  logOpenSmartSnippetSuggestionSource,
} from '../../features/question-answering/question-answering-analytics-actions';
import {QuestionAnsweringSection} from '../../state/state-sections';
import {
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
} from '../../features/question-answering/question-answering-actions';
import {Result} from '../../api/search/search/result';
import {getResultProperty} from '../../features/result-templates/result-templates-helpers';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
} from '../core/interactive-result/headless-core-interactive-result';
import {QuestionAnsweringRelatedQuestionState} from '../../features/question-answering/question-answering-state';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';

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
  /**
   * Selects the source, logging a UA event to the Coveo Platform if the source wasn't already selected before.
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
   * Prepares to select the source after a certain delay, sending analytics if it was never selected before.
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

  let lastSearchResponseId: string | null = null;
  let interactiveResultsPerRelatedQuestion: Record<
    string,
    InteractiveResultCore
  > = {};
  let clickedRelatedQuestions: Record<string, boolean> = {};
  const getInteractiveResult = (
    relatedQuestion: QuestionAnsweringRelatedQuestionState
  ) => {
    const {searchResponseId} = getState().search;
    if (lastSearchResponseId !== searchResponseId) {
      lastSearchResponseId = searchResponseId;
      interactiveResultsPerRelatedQuestion = {};
      clickedRelatedQuestions = {};
    }

    if (
      relatedQuestion.questionAnswerId in interactiveResultsPerRelatedQuestion
    ) {
      return interactiveResultsPerRelatedQuestion[
        relatedQuestion.questionAnswerId
      ];
    }

    return (interactiveResultsPerRelatedQuestion[
      relatedQuestion.questionAnswerId
    ] = buildInteractiveResultCore(
      engine,
      {options: {selectionDelay: props?.options?.selectionDelay}},
      () => {
        if (clickedRelatedQuestions[relatedQuestion.questionAnswerId]) {
          return;
        }
        const result = getResult(relatedQuestion);
        if (!result) {
          return;
        }
        clickedRelatedQuestions[relatedQuestion.questionAnswerId] = true;
        engine.dispatch(
          logOpenSmartSnippetSuggestionSource({
            questionAnswerId: relatedQuestion.questionAnswerId,
          })
        );
        engine.dispatch(pushRecentResult(result));
      }
    ));
  };

  const getPayloadFromIdentifier = (
    identifier: string | QuestionAnswerDocumentIdentifier
  ) =>
    typeof identifier === 'string'
      ? {questionAnswerId: identifier}
      : identifier;

  const getRelatedQuestionStateFromIdentifier = (identifier: string) =>
    getState().questionAnswering.relatedQuestions.find(
      (relatedQuestion) => relatedQuestion.questionAnswerId === identifier
    );

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
    selectSource(identifier) {
      const relatedQuestionState =
        getRelatedQuestionStateFromIdentifier(identifier);
      if (!relatedQuestionState) {
        return;
      }
      getInteractiveResult(relatedQuestionState).select();
    },
    beginDelayedSelectSource(identifier) {
      const relatedQuestionState =
        getRelatedQuestionStateFromIdentifier(identifier);
      if (!relatedQuestionState) {
        return;
      }
      getInteractiveResult(relatedQuestionState).beginDelayedSelect();
    },
    cancelPendingSelectSource(identifier) {
      const relatedQuestionState =
        getRelatedQuestionStateFromIdentifier(identifier);
      if (!relatedQuestionState) {
        return;
      }
      getInteractiveResult(relatedQuestionState).cancelPendingSelect();
    },
  };
}

function loadSmartSnippetQuestionsListReducer(
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
