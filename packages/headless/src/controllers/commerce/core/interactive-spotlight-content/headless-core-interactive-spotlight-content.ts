import type {SpotlightContent} from '../../../../api/commerce/common/result.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {spotlightContentClick} from '../../../../features/commerce/spotlight-content/spotlight-content-actions.js';
import type {
  InteractiveResultCore,
  InteractiveResultCoreProps as InteractiveResultHeadlessCoreProps,
  InteractiveResultCoreOptions as InteractiveSpotlightContentCoreOptions,
} from '../../../core/interactive-result/headless-core-interactive-result.js';
import {buildInteractiveResultCore} from '../../../core/interactive-result/headless-core-interactive-result.js';

export interface InteractiveSpotlightContentOptions
  extends InteractiveSpotlightContentCoreOptions {
  /**
   * The spotlight content to log analytics for.
   */
  spotlightContent: SpotlightContent;
}

export interface InteractiveSpotlightContentCoreProps
  extends InteractiveResultHeadlessCoreProps {
  /**
   * The options for the `InteractiveSpotlightContent` sub-controller.
   */
  options: InteractiveSpotlightContentOptions;

  /**
   * The selector to fetch the response ID from the state.
   */
  responseIdSelector: (state: CommerceEngineState) => string;
}

export type InteractiveSpotlightContentProps = Omit<
  InteractiveSpotlightContentCoreProps,
  'responseIdSelector'
>;

/**
 * The `InteractiveSpotlightContent` sub-controller provides an interface for handling long presses, multiple clicks, etc. to ensure
 * analytics events are logged properly when a user selects a spotlight content item.
 */
export interface InteractiveSpotlightContent extends InteractiveResultCore {
  warningMessage?: string;
}

/**
 * Creates an `InteractiveSpotlightContent` sub-controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `InteractiveSpotlightContent` properties.
 * @returns An `InteractiveSpotlightContent` sub-controller instance.
 *
 * @group Buildable controllers
 * @category CoreInteractiveSpotlightContent
 */
export function buildCoreInteractiveSpotlightContent(
  engine: CommerceEngine,
  props: InteractiveSpotlightContentCoreProps
): InteractiveSpotlightContent {
  let wasOpened = false;

  const getWarningMessage = () => {
    const {id, desktopImage} = props.options.spotlightContent;

    const warnings = [];

    if (!id) {
      warnings.push(
        "- Could not retrieve 'id' property from spotlight content; this is required for analytics."
      );
    }
    if (!desktopImage) {
      warnings.push(
        "- Could not retrieve 'desktopImage' property from spotlight content; this is required for analytics."
      );
    }

    if (warnings.length === 0) {
      return;
    }

    return `Some required analytics properties could not be retrieved from the spotlight content with \
id '${id}':\n\n${warnings.join('\n')}\n\nReview the configuration to ensure the spotlight content contains the correct metadata.`;
  };

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(
      spotlightContentClick({
        id: props.options.spotlightContent.id,
        desktopImage: props.options.spotlightContent.desktopImage,
        position: props.options.spotlightContent.position,
        responseId:
          props.options.spotlightContent.responseId ??
          props.responseIdSelector(engine[stateKey]),
      })
    );
  };

  return {
    ...buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened),
    warningMessage: getWarningMessage(),
  };
}
