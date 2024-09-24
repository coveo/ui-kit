import {Controller} from '../../controller/headless-controller.js';

/**
 * The `NotifyTrigger` controller handles notify triggers. A [Notify trigger](https://docs.coveo.com/en/3413#notify) query pipeline rule lets you define a message to be displayed to the end user when a certain condition is met.
 */
export interface NotifyTrigger extends Controller {
  /**
   * the state of the `NotifyTrigger` controller.
   */
  state: NotifyTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `NotifyTrigger` controller.
 */
export interface NotifyTriggerState {
  /**
   * The notifications to display to the user after receiving notification triggers.
   */
  notifications: string[];
}
