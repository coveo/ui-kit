import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {questionAnswering, search} from '../../../app/reducers';
import {
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetSuggestionInlineLink,
} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  QuestionAnsweringSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {getObjectHash} from '../../../utils/utils';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
} from '../../core/interactive-result/headless-core-interactive-result';
import {InlineLink} from '../../smart-snippet/headless-smart-snippet-interactive-inline-links';

export interface SmartSnippetInteractiveInlineLinksOptions {
  /**
   * The amount of time to wait before selecting the result after calling `beginDelayedSelect`.
   *
   * @defaultValue `1000`
   */
  selectionDelay?: number;
}

export interface SmartSnippetInteractiveInlineLinksProps {
  /**
   * The options for the result controller core.
   */
  options?: SmartSnippetInteractiveInlineLinksOptions;
}

export interface SmartSnippetInteractiveInlineLinks {
  /**
   * Selects the result, logging a UA event to the Coveo Platform if the result wasn't selected before.
   *
   * In a DOM context, it's recommended to call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   */
  selectInlineLink(link: InlineLink, questionAnswerId?: string): void;
  /**
   * Prepares to select the result after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, it's recommended to call this method on the `touchstart` event.
   */
  beginDelayedSelectInlineLink(
    link: InlineLink,
    questionAnswerId?: string
  ): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelect`.
   *
   * In a DOM context, it's recommended to call this method on the `touchend` event.
   */
  cancelPendingSelectInlineLink(
    link: InlineLink,
    questionAnswerId?: string
  ): void;
}

/**
 * Creates the insight result controller for SmartSnippet.
 *
 * @param engine - The headless insight engine.
 * @param props - The configurable controller properties.
 * @param action - The action to be triggered on select.
 * @returns A controller instance.
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
  engine: InsightEngine
): engine is InsightEngine<QuestionAnsweringSection & SearchSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
