import type {Result} from '../../api/search/search/result.js';
import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logOpenSmartSnippetSuggestionSource} from '../../features/question-answering/question-answering-analytics-actions.js';
import {
  answerSourceSelector,
  relatedQuestionSelector,
} from '../../features/question-answering/question-answering-selectors.js';
import {questionAnsweringReducer as questionAnswering} from '../../features/question-answering/question-answering-slice.js';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import type {QuestionAnsweringSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
} from '../core/interactive-result/headless-core-interactive-result.js';

/**
 * @internal
 */
interface SmartSnippetInteractiveQuestionsOptions {
  selectionDelay?: number;
}

/**
 * @internal
 */
interface SmartSnippetInteractiveQuestionsProps {
  options?: SmartSnippetInteractiveQuestionsOptions;
}

/**
 * @internal
 */
interface SmartSnippetInteractiveQuestions {
  selectSource(questionAnswerId: string): void;
  beginDelayedSelectSource(questionAnswerId: string): void;
  cancelPendingSelectSource(questionAnswerId: string): void;
}

/**
 * @internal
 */
export function buildSmartSnippetInteractiveQuestions(
  engine: SearchEngine | FrankensteinEngine,
  props?: SmartSnippetInteractiveQuestionsProps
): SmartSnippetInteractiveQuestions {
  const searchEngine = ensureSearchEngine(engine);
  if (!loadSmartSnippetInteractiveQuestionsReducer(searchEngine)) {
    throw loadReducerError;
  }

  const getState = () => searchEngine.state;

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
      searchEngine,
      {options: {selectionDelay: props?.options?.selectionDelay}},
      () => {
        if (relatedQuestionWasClicked(questionAnswerId)) {
          return;
        }
        searchEngine.dispatch(
          logOpenSmartSnippetSuggestionSource({
            questionAnswerId,
          })
        );
        searchEngine.dispatch(pushRecentResult(source));
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
