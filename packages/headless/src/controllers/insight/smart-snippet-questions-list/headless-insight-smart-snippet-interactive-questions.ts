import {Result} from '../../../api/search/search/result';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logOpenSmartSnippetSuggestionSource} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  answerSourceSelector,
  relatedQuestionSelector,
} from '../../../features/question-answering/question-answering-selectors';
import {questionAnsweringReducer as questionAnswering} from '../../../features/question-answering/question-answering-slice';
import {pushRecentResult} from '../../../features/recent-results/recent-results-actions';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  QuestionAnsweringSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
} from '../../core/interactive-result/headless-core-interactive-result';

/**
 * @internal
 */
export interface SmartSnippetInteractiveQuestionsOptions {
  selectionDelay?: number;
}

/**
 * @internal
 */
export interface SmartSnippetInteractiveQuestionsProps {
  options?: SmartSnippetInteractiveQuestionsOptions;
}

/**
 * @internal
 */
export interface SmartSnippetInteractiveQuestions {
  selectSource(questionAnswerId: string): void;
  beginDelayedSelectSource(questionAnswerId: string): void;
  cancelPendingSelectSource(questionAnswerId: string): void;
}

/**
 * @internal
 */
export function buildInsightSmartSnippetInteractiveQuestions(
  engine: InsightEngine,
  props?: SmartSnippetInteractiveQuestionsProps
): SmartSnippetInteractiveQuestions {
  if (!loadSmartSnippetInteractiveQuestionsReducer(engine)) {
    throw loadReducerError;
  }

  const getState = () => engine.state;

  const getSource = (questionAnswerId: string) => {
    const state = getState();
    const questionAnswer = relatedQuestionSelector(state, questionAnswerId);
    if (!questionAnswer) {
      return null;
    }
    return answerSourceSelector(state, questionAnswer.documentId);
  };

  const clickedRelatedQuestions = new Set<string>();
  const relatedQuestionWasClicked = (questionAnswerId: string) => {
    if (clickedRelatedQuestions.has(questionAnswerId)) {
      return true;
    }
    clickedRelatedQuestions.add(questionAnswerId);
    return false;
  };

  let lastSearchResponseId: string | null = null;
  const resetInteractiveResultsIfSearchResponseChanged = (
    currentSearchResponseId: string
  ) => {
    if (lastSearchResponseId !== currentSearchResponseId) {
      lastSearchResponseId = currentSearchResponseId;
      interactiveResultsPerRelatedQuestion = {};
      clickedRelatedQuestions.clear();
    }
  };

  const buildRelatedQuestionInteractiveResult = (
    source: Result,
    questionAnswerId: string
  ) =>
    buildInteractiveResultCore(
      engine,
      {options: {selectionDelay: props?.options?.selectionDelay}},
      () => {
        if (relatedQuestionWasClicked(questionAnswerId)) {
          return;
        }
        engine.dispatch(
          logOpenSmartSnippetSuggestionSource({
            questionAnswerId,
          })
        );
        engine.dispatch(pushRecentResult(source));
      }
    );

  let interactiveResultsPerRelatedQuestion: Record<
    string,
    InteractiveResultCore
  > = {};
  const getInteractiveResult = (questionAnswerId: string) => {
    const {searchResponseId} = getState().search;
    resetInteractiveResultsIfSearchResponseChanged(searchResponseId);

    const source = getSource(questionAnswerId);
    if (!source) {
      return null;
    }

    if (questionAnswerId in interactiveResultsPerRelatedQuestion) {
      return interactiveResultsPerRelatedQuestion[questionAnswerId];
    }

    interactiveResultsPerRelatedQuestion[questionAnswerId] =
      buildRelatedQuestionInteractiveResult(source, questionAnswerId);
    return interactiveResultsPerRelatedQuestion[questionAnswerId];
  };

  return {
    selectSource(questionAnswerId) {
      getInteractiveResult(questionAnswerId)?.select();
    },
    beginDelayedSelectSource(questionAnswerId) {
      getInteractiveResult(questionAnswerId)?.beginDelayedSelect();
    },
    cancelPendingSelectSource(questionAnswerId) {
      getInteractiveResult(questionAnswerId)?.cancelPendingSelect();
    },
  };
}

function loadSmartSnippetInteractiveQuestionsReducer(
  engine: InsightEngine
): engine is InsightEngine<QuestionAnsweringSection & SearchSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
