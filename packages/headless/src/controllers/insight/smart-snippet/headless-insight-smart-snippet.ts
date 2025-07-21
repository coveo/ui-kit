import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {insightSmartSnippetAnalyticsClient} from '../../../features/question-answering/question-answering-insight-analytics-actions.js';
import {
  buildCoreSmartSnippet,
  type SmartSnippet,
  type SmartSnippetProps,
} from '../../core/smart-snippet/headless-core-smart-snippet.js';
import type {InlineLink} from '../../smart-snippet/headless-smart-snippet-interactive-inline-links.js';
import {buildSmartSnippetInteractiveInlineLinks} from './headless-insight-smart-snippet-interactive-inline-links.js';

export type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering.js';
export type {
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
} from '../../core/smart-snippet/headless-core-smart-snippet.js';

export type {InlineLink};
/**
 * Creates an insight `SmartSnippet` controller instance.
 *
 * @param engine - The headless insight engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
 *
 * @group Controllers
 * @category SmartSnippet
 * */
export function buildSmartSnippet(
  engine: InsightEngine,
  props?: SmartSnippetProps
): SmartSnippet {
  const smartSnippet = buildCoreSmartSnippet(
    engine,
    insightSmartSnippetAnalyticsClient,
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
