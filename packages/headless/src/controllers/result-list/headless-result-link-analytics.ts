import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {logDocumentOpen} from '../../features/result/result-analytics-actions';

// 1 second is a reasonable amount of time to catch most longpress actions
const defaultDelay = 1000;

type ResultLinkAnalyticsOptions = {
  /**
   * The result for which to log analytics.
   */
  result: Result;
  /**
   * The amount of time to wait before selecting the result after calling `beginDelayedSelect`.
   */
  delay?: number;
};

type ResultLinkAnalyticsProps = {
  /** The options for the `ResultLinkAnalytics` controller. */
  options: ResultLinkAnalyticsOptions;
};

/**
 * The `ResultLinkAnalytics` headless controller helps more easily send analytics when a search result is selected.
 */
export type ResultLinkAnalytics = ReturnType<typeof buildResultLinkAnalytics>;

export function buildResultLinkAnalytics(
  engine: Engine,
  props: ResultLinkAnalyticsProps
) {
  let wasOpened = false;
  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logDocumentOpen(props.options.result));
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
        props.options.delay ?? defaultDelay
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
