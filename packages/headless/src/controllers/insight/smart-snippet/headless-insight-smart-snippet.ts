import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {insightSmartSnippetAnalyticsClient} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildCoreSmartSnippet,
} from '../../core/smart-snippet/headless-core-smart-snippet';
import {buildSmartSnippetInteractiveInlineLinks} from './headless-insight-smart-snippet-interactive-inline-links';

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
 * */
export function buildSmartSnippet(
  engine: InsightEngine,
  props?: SmartSnippetProps
): SmartSnippet {
  const smartSnippet = buildCoreSmartSnippet(
    engine,
    insightSmartSnippetAnalyticsClient
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
