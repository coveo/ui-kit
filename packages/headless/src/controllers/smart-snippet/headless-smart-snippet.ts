import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../app/engine.js';
import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {smartSnippetAnalyticsClient} from '../../features/question-answering/question-answering-analytics-actions.js';
import {
  buildCoreSmartSnippet,
  type SmartSnippet,
  type SmartSnippetCore,
  type SmartSnippetOptions,
  type SmartSnippetProps,
  type SmartSnippetState,
} from '../core/smart-snippet/headless-core-smart-snippet.js';
import {buildSmartSnippetInteractiveInlineLinks} from './headless-smart-snippet-interactive-inline-links.js';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering.js';
export type {
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
};

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
 *
 * @group Controllers
 * @category SmartSnippet
 * */
export function buildSmartSnippet(
  engine: SearchEngine | FrankensteinEngine,
  props?: SmartSnippetProps
): SmartSnippet {
  const searchEngine = ensureSearchEngine(engine);
  warnIfUsingNextAnalyticsModeForServiceFeature(
    searchEngine.state.configuration.analytics.analyticsMode
  );
  const smartSnippet = buildCoreSmartSnippet(
    searchEngine,
    smartSnippetAnalyticsClient,
    props
  );

  const interactiveInlineLinks = buildSmartSnippetInteractiveInlineLinks(
    searchEngine,
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
