import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {logDocumentOpen} from '../../features/result/result-analytics-actions';
import {ConfigurationSection} from '../../state/state-sections';

// 1 second is a reasonable amount of time to catch most longpress actions
const defaultDelay = 1000;

export interface ResultLinkOptions {
  /**
   * The query result.
   */
  result: Result;
  /**
   * The amount of time to wait before selecting the result after calling `beginDelayedSelect`.
   */
  selectionDelay?: number;
}

export interface ResultLinkProps {
  /** The options for the `ResultLink` controller. */
  options: ResultLinkOptions;
}

/**
 * The `ResultLink` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects a query result.
 */
export interface ResultLink {
  /**
   * Selects the result, logging a UA event to the Coveo Platform if the result wasn't selected before.
   *
   * In a DOM context, it's recommended to call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   */
  select: () => void;
  /**
   * Prepares to select the result after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, it's recommended to call this method on the `touchstart` event.
   */
  beginDelayedSelect: () => void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelect`.
   *
   * In a DOM context, it's recommended to call this method on the `touchend` event.
   */
  cancelPendingSelect: () => void;
}

export function buildResultLink(
  engine: Engine<ConfigurationSection>,
  props: ResultLinkProps
): ResultLink {
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
    select: logAnalyticsIfNeverOpened,

    beginDelayedSelect() {
      longPressTimer = setTimeout(
        logAnalyticsIfNeverOpened,
        options.selectionDelay
      );
    },

    cancelPendingSelect() {
      longPressTimer && clearTimeout(longPressTimer);
    },
  };
}
