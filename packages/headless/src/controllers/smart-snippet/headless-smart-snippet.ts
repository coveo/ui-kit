import {SearchEngine} from '../../app/search-engine/search-engine';
import {smartSnippetAnalyticsClient} from '../../features/question-answering/question-answering-analytics-actions';
import {
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  buildCoreSmartSnippet,
} from '../core/smart-snippet/headless-core-smart-snippet';
import {buildSmartSnippetInteractiveInlineLinks} from './headless-smart-snippet-interactive-inline-links';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
export type {
  SmartSnippet,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  SmartSnippetCore,
};

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
 * */
export function buildSmartSnippet(
  engine: SearchEngine,
  props?: SmartSnippetProps
): SmartSnippet {
  const smartSnippet = buildCoreSmartSnippet(
    engine,
    smartSnippetAnalyticsClient,
    props
  );

  const interactiveInlineLinks = buildSmartSnippetInteractiveInlineLinks(
    engine,
    {options: {selectionDelay: props?.options?.selectionDelay}}
  );

  return {
    ...smartSnippet,

    get state() {
      return smartSnippet.state;
    },
    selectInlineLink(link) {
      interactiveInlineLinks.selectInlineLink(link);
    },
    beginDelayedSelectInlineLink(link) {
      interactiveInlineLinks.beginDelayedSelectInlineLink(link);
    },
    cancelPendingSelectInlineLink(link) {
      interactiveInlineLinks.cancelPendingSelectInlineLink(link);
    },
  };
}
