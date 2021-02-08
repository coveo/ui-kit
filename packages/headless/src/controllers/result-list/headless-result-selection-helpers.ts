import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {ResultAnalyticsActions} from '../../features/analytics';

// 1 second is a reasonable amount of time to catch most longpress actions
const defaultDelay = 1000;

/**
 * Helpers that more easily allow sending analytics when a search result is selected.
 */
export type ResultSelectionHelpers = ReturnType<
  typeof buildResultSelectionHelpers
>;

/**
 * Creates helpers that more easily allow sending analytics when a search result is selected.
 */
export function buildResultSelectionHelpers(engine: Engine, result: Result) {
  let wasOpened = false;
  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(ResultAnalyticsActions.logDocumentOpen(result));
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
     *
     * @param delay The amount of time to wait before selecting the result.
     */
    beginDelayedSelect: (delay = defaultDelay) => {
      longPressTimer = setTimeout(logAnalyticsIfNeverOpened, delay);
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
