import {CaseAssistEngine} from '../../case-assist.index';
import {logDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result';

export interface CaseAssistInteractiveResultOptions
  extends InteractiveResultCoreOptions {}

export interface CaseAssistInteractiveResultProps
  extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   * */
  options: CaseAssistInteractiveResultOptions;
}

/**
 * The `InteractiveResult` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
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
    engine.dispatch(logDocumentSuggestionClick(props.options.result.uniqueId));
  };

  return buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened);
}
