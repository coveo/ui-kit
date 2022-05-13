import {questionAnswering, search} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {QuestionAnsweringSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {Result} from '../../api/search/search/result';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
} from '../core/interactive-result/headless-core-interactive-result';
import {logOpenSmartSnippetSuggestionSource} from '../../features/question-answering/question-answering-analytics-actions';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {getResultProperty} from '../../features/result-templates/result-templates-helpers';

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
export function buildSmartSnippetInteractiveQuestions(
  engine: SearchEngine,
  props?: SmartSnippetInteractiveQuestionsProps
): SmartSnippetInteractiveQuestions {
  if (!loadSmartSnippetInteractiveQuestionsReducer(engine)) {
    throw loadReducerError;
  }

  const getState = () => engine.state;

  const getSource = (questionAnswerId: string) => {
    const snippetState = getState().questionAnswering.relatedQuestions.find(
      (relatedQuestion) => relatedQuestion.questionAnswerId === questionAnswerId
    );
    if (!snippetState) {
      return null;
    }
    const {contentIdKey, contentIdValue} = snippetState;
    return (
      engine.state.search.results.find(
        (result) => getResultProperty(result, contentIdKey) === contentIdValue
      ) ?? null
    );
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
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
