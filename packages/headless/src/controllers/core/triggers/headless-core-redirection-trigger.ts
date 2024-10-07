import {Controller} from '../../controller/headless-controller.js';

/**
 * The `RedirectionTrigger` controller handles redirection triggers. A [Redirection trigger](https://docs.coveo.com/en/3413#redirect) query pipeline rule lets you define a URL to redirect the user's browser to when a certain condition is met.
 */
export interface RedirectionTrigger extends Controller {
  /**
   * the state of the `RedirectionTrigger` controller.
   */
  state: RedirectionTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RedirectionTrigger` controller.
 */
export interface RedirectionTriggerState {
  /**
   * The url used for the redirection.
   */
  redirectTo: string;
}
