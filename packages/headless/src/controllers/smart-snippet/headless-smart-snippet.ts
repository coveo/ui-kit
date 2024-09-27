import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {smartSnippetAnalyticsClient} from '../../features/question-answering/question-answering-analytics-actions.js';
import {
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  buildCoreSmartSnippet,
} from '../core/smart-snippet/headless-core-smart-snippet.js';
import {buildSmartSnippetInteractiveInlineLinks} from './headless-smart-snippet-interactive-inline-links.js';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering.js';
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
