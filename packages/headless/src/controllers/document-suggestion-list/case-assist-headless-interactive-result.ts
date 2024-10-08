import {Result} from '../../api/search/search/result.js';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {logDocumentSuggestionOpen} from '../../features/case-assist/case-assist-analytics-actions.js';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result.js';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
};
export interface CaseAssistInteractiveResultOptions
  extends InteractiveResultCoreOptions {
  /**
   * The query result.
   */
  result: Result;
}

export interface CaseAssistInteractiveResultProps
  extends InteractiveResultCoreProps {
  /**
   * The options for the `CaseAssistInteractiveResult` controller.
   * */
  options: CaseAssistInteractiveResultOptions;
}

/**
 * The `CaseAssistInteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 */
export interface CaseAssistInteractiveResult extends InteractiveResultCore {}

/**
 * Creates a `CaseAssistInteractiveResult` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CaseAssistInteractiveResult` properties.
 * @returns A `CaseAssistInteractiveResult` controller instance.
 */
export function buildCaseAssistInteractiveResult(
  engine: CaseAssistEngine,
  props: CaseAssistInteractiveResultProps
): CaseAssistInteractiveResult {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logDocumentSuggestionOpen(props.options.result.uniqueId));
  };

  return buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened);
}
