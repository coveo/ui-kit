import type {CoreEngine} from '../../../app/engine.js';
import type {CustomAction} from '../../../features/analytics/analytics-utils.js';
import type {InlineLink} from '../../../utils/inline-link.js';
import {
  buildInteractiveResultCore,
  type InteractiveResultCore,
  type InteractiveResultCoreOptions,
  type InteractiveResultCoreProps,
} from '../../core/interactive-result/headless-core-interactive-result.js';

export interface InteractiveGeneratedAnswerInlineLinkOptions extends InteractiveResultCoreOptions {
  /**
   * The generated answer inline link.
   */
  link: InlineLink;
  /**
   * The unique identifier of the generated answer associated with the inline link.
   */
  answerId: string;
}

export interface InteractiveGeneratedAnswerInlineLinkProps extends InteractiveResultCoreProps {
  /**
   * The options for the `InteractiveGeneratedAnswerInlineLink` controller.
   */
  options: InteractiveGeneratedAnswerInlineLinkOptions;
}

/**
 * The `InteractiveGeneratedAnswerInlineLink` controller provides an interface
 * for triggering desirable side effects, such as logging UA events to the
 * Coveo Platform, when a user selects a generated answer inline link.
 *
 * @group Controllers
 * @category InteractiveGeneratedAnswerInlineLink
 */
export interface InteractiveGeneratedAnswerInlineLink extends InteractiveResultCore {}

interface InteractiveGeneratedAnswerInlineLinkAnalyticsClient {
  logGeneratedAnswerOpenInlineLink(
    link: InlineLink,
    answerId: string
  ): CustomAction;
}

/**
 * Creates a core `InteractiveGeneratedAnswerInlineLink` controller instance.
 *
 * @param engine - The headless engine.
 * @param analyticsClient - The analytics client.
 * @param props - The configurable `InteractiveGeneratedAnswerInlineLink`
 * properties.
 * @returns An `InteractiveGeneratedAnswerInlineLink` controller instance.
 */
export function buildInteractiveGeneratedAnswerInlineLinkCore(
  engine: CoreEngine,
  analyticsClient: InteractiveGeneratedAnswerInlineLinkAnalyticsClient,
  props: InteractiveGeneratedAnswerInlineLinkProps
): InteractiveGeneratedAnswerInlineLink {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }

    wasOpened = true;
    engine.dispatch(
      analyticsClient.logGeneratedAnswerOpenInlineLink(
        props.options.link,
        props.options.answerId
      )
    );
  };

  return buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened);
}
