import type {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {CustomAction} from '../../../features/analytics/analytics-utils.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
  type InteractiveResultCoreOptions,
  type InteractiveResultCoreProps,
} from '../../core/interactive-result/headless-core-interactive-result.js';

export interface InteractiveCitationOptions
  extends InteractiveResultCoreOptions {
  /**
   * The generated answer citation.
   */
  citation: GeneratedAnswerCitation;
}

export interface InteractiveCitationProps extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveCitation` controller.
   */
  options: InteractiveCitationOptions;
}

/**
 * The `InteractiveCitation` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a generated answer citation.
 *
 * @group Controllers
 * @category InteractiveCitation
 */
export interface InteractiveCitation extends InteractiveResultCore {}

interface InteractiveCitationAnalyticsClient {
  logOpenGeneratedAnswerSource(citationId: string): CustomAction;
}

/**
 * Creates a core `InteractiveCitation` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveCitation` properties.
 * @returns An `InteractiveCitation` controller instance.
 */
export function buildInteractiveCitationCore(
  engine: CoreEngine,
  analyticsClient: InteractiveCitationAnalyticsClient,
  props: InteractiveCitationProps
): InteractiveCitation {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(
      analyticsClient.logOpenGeneratedAnswerSource(props.options.citation.id)
    );
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
  };

  return buildInteractiveResultCore(engine, props, action);
}
