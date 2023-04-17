import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {questionAnswering, search} from '../../../app/reducers';
import {logOpenSmartSnippetSuggestionInlineLink} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  QuestionAnsweringSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {getObjectHash} from '../../../utils/utils';
import {
  buildInteractiveResultCore,
  InlineLink,
  InteractiveResultCore,
} from '../../core/interactive-result/headless-core-interactive-result';

/**
 * @internal
 */
export interface SmartSnippetInteractiveInlineLinksOptions {
  selectionDelay?: number;
}

/**
 * @internal
 */
export interface SmartSnippetInteractiveInlineLinksProps {
  options?: SmartSnippetInteractiveInlineLinksOptions;
}

/**
 * @internal
 */
export interface SmartSnippetInteractiveInlineLinks {
  selectInlineLink(link: InlineLink, questionAnswerId?: string): void;
  beginDelayedSelectInlineLink(
    link: InlineLink,
    questionAnswerId?: string
  ): void;
  cancelPendingSelectInlineLink(
    link: InlineLink,
    questionAnswerId?: string
  ): void;
}

/**
 * @internal
 */
export function buildSmartSnippetInteractiveInlineLinks(
  engine: InsightEngine,
  props?: SmartSnippetInteractiveInlineLinksProps
): SmartSnippetInteractiveInlineLinks {
  if (!loadSmartSnippetInteractiveInlineLinksReducer(engine)) {
    throw loadReducerError;
  }

  const getState = () => engine.state;

  const clickedRelatedQuestions = new Set<string>();
  const inlineLinkWasClicked = (linkId: string) => {
    if (clickedRelatedQuestions.has(linkId)) {
      return true;
    }
    clickedRelatedQuestions.add(linkId);
    return false;
  };

  let lastSearchResponseId: string | null = null;
  const resetInteractiveResultsIfSearchResponseChanged = (
    currentSearchResponseId: string
  ) => {
    if (lastSearchResponseId !== currentSearchResponseId) {
      lastSearchResponseId = currentSearchResponseId;
      interactiveResultsPerInlineLink = {};
      clickedRelatedQuestions.clear();
    }
  };

  const buildInlineLinkInteractiveResult = (
    link: InlineLink,
    linkId: string,
    questionAnswerId?: string
  ) =>
    buildInteractiveResultCore(
      engine,
      {options: {selectionDelay: props?.options?.selectionDelay}},
      () => {
        if (inlineLinkWasClicked(linkId)) {
          return;
        }
        // TODO: Replace with the comment below after creating the logOpenSmartSnippetInlineLink action for the insight use case.
        if (questionAnswerId) {
          engine.dispatch(
            logOpenSmartSnippetSuggestionInlineLink({questionAnswerId}, link)
          );
        }
        // engine.dispatch(
        //   questionAnswerId
        //     ? logOpenSmartSnippetSuggestionInlineLink({questionAnswerId}, link)
        //     : logOpenSmartSnippetInlineLink(link)
        // );
      }
    );

  let interactiveResultsPerInlineLink: Record<string, InteractiveResultCore> =
    {};
  const getInteractiveResult = (
    link: InlineLink,
    questionAnswerId?: string
  ) => {
    const {searchResponseId} = getState().search;
    resetInteractiveResultsIfSearchResponseChanged(searchResponseId);

    const linkId = getObjectHash({...link, questionAnswerId});
    if (linkId in interactiveResultsPerInlineLink) {
      return interactiveResultsPerInlineLink[linkId];
    }

    interactiveResultsPerInlineLink[linkId] = buildInlineLinkInteractiveResult(
      link,
      linkId,
      questionAnswerId
    );
    return interactiveResultsPerInlineLink[linkId];
  };

  return {
    selectInlineLink(link, questionAnswerId) {
      getInteractiveResult(link, questionAnswerId)?.select();
    },
    beginDelayedSelectInlineLink(link, questionAnswerId) {
      getInteractiveResult(link, questionAnswerId)?.beginDelayedSelect();
    },
    cancelPendingSelectInlineLink(link, questionAnswerId) {
      getInteractiveResult(link, questionAnswerId)?.cancelPendingSelect();
    },
  };
}

function loadSmartSnippetInteractiveInlineLinksReducer(
  engine: InsightEngine
): engine is InsightEngine<QuestionAnsweringSection & SearchSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
