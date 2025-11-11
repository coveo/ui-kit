import type {Controller} from '../../controller/headless-controller.js';

/**
 * The `RedirectionTrigger` controller handles redirection triggers. A [Redirection trigger](https://docs.coveo.com/en/3413#redirect) query pipeline rule lets you define a URL to redirect the user's browser to when a certain condition is met.
 *
 * Example: [redirection-trigger.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/triggers/redirection-trigger.fn.tsx)
 *
 * @group Controllers
 * @category RedirectionTrigger
 */
export interface RedirectionTrigger extends Controller {
  /**
   * the state of the `RedirectionTrigger` controller.
   */
  state: RedirectionTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RedirectionTrigger` controller.
 *
 * @group Controllers
 * @category RedirectionTrigger
 */
export interface RedirectionTriggerState {
  /**
   * The url used for the redirection.
   */
  redirectTo: string;
}
