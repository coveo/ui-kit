import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {logDocumentOpen} from '../../features/result/result-analytics-actions';

// 1 second is a reasonable amount of time to catch most longpress actions
const defaultDelay = 1000;

type ResultLinkOptions = {
  /**
   * The result for which to perform actions.
   */
  result: Result;
  /**
   * The amount of time to wait before selecting the result after calling `beginDelayedSelect`.
   */
  selectionDelay?: number;
};

type ResultLinkProps = {
  /** The options for the `ResultLink` controller. */
  options: ResultLinkOptions;
};

/**
 * The `ResultLink` headless controller allows users to perform standard actions on results.
 */
export type ResultLink = ReturnType<typeof buildResultLink>;

export function buildResultLink(engine: Engine, props: ResultLinkProps) {
  const options: Required<ResultLinkOptions> = {
    selectionDelay: defaultDelay,
    ...props.options,
  };

  let wasOpened = false;
  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logDocumentOpen(options.result));
  };

  let longPressTimer: NodeJS.Timeout;

  return {
    /**
     * Selects the result, sending analytics if it was never selected before.
     *
     * In a DOM context, it's recommended to execute this on all the following events:
     * * `contextmenu`
     * * `click`
     * * `mouseup`
     * * `mousedown`
     */
    select: logAnalyticsIfNeverOpened,
    /**
     * Prepares to select the result after a certain delay, sending analytics if it was never selected before.
     *
     * This is especially useful in a DOM context to log analytics when a user long presses.
     *
     * In a DOM context, it's recommended to execute this on the `touchstart` event.
     */
    beginDelayedSelect: () => {
      longPressTimer = setTimeout(
        logAnalyticsIfNeverOpened,
        options.selectionDelay
      );
    },
    /**
     * Cancels the pending selection caused by `beginDelayedSelect`.
     *
     * In a DOM context, it's recommended to execute this on the `touchend` event.
     */
    cancelPendingSelect: () => {
      longPressTimer && clearTimeout(longPressTimer);
    },
  };
}
