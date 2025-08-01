import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetSuggestionInlineLink,
} from '../../features/question-answering/question-answering-analytics-actions.js';
import {questionAnsweringReducer as questionAnswering} from '../../features/question-answering/question-answering-slice.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import type {QuestionAnsweringSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {getObjectHash} from '../../utils/utils.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
} from '../core/interactive-result/headless-core-interactive-result.js';

export interface InlineLink {
  /**
   * The text of the inline link.
   */
  linkText: string;
  /**
   * The URL of the inline link.
   */
  linkURL: string;
}

/**
 * @internal
 */
interface SmartSnippetInteractiveInlineLinksOptions {
  selectionDelay?: number;
}

/**
 * @internal
 */
interface SmartSnippetInteractiveInlineLinksProps {
  options?: SmartSnippetInteractiveInlineLinksOptions;
}

/**
 * @internal
 */
interface SmartSnippetInteractiveInlineLinks {
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
  engine: SearchEngine,
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
        engine.dispatch(
          questionAnswerId
            ? logOpenSmartSnippetSuggestionInlineLink({questionAnswerId}, link)
            : logOpenSmartSnippetInlineLink(link)
        );
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
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
