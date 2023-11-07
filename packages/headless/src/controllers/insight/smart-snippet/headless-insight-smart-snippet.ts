import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {insightSmartSnippetAnalyticsClient} from '../../../features/question-answering/question-answering-insight-analytics-actions';
import {
  SmartSnippet,
  SmartSnippetProps,
  buildCoreSmartSnippet,
} from '../../core/smart-snippet/headless-core-smart-snippet';
import {InlineLink} from '../../smart-snippet/headless-smart-snippet-interactive-inline-links';
import {buildSmartSnippetInteractiveInlineLinks} from './headless-insight-smart-snippet-interactive-inline-links';

export type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering';
export type {
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  SmartSnippet,
  SmartSnippetCore,
} from '../../core/smart-snippet/headless-core-smart-snippet';

export type {InlineLink};
/**
 * Creates an insight `SmartSnippet` controller instance.
 *
 * @param engine - The headless insight engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
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
