import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {logOpenGeneratedAnswerSource} from '../../features/generated-answer/generated-answer-analytics-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from '../core/interactive-result/headless-core-interactive-result';

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
 */
export interface InteractiveCitation extends InteractiveResultCore {}

/**
 * Creates an `InteractiveCitation` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveCitation` properties.
 * @returns An `InteractiveCitation` controller instance.
 */
export function buildInteractiveCitation(
  engine: SearchEngine,
  props: InteractiveCitationProps
): InteractiveCitation {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logOpenGeneratedAnswerSource(props.options.citation.id));
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
  };

  return buildInteractiveResultCore(engine, props, action);
}
