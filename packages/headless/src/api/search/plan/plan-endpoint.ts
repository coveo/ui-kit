import {isRedirectTrigger} from '../../common/trigger.js';
import type {PlanResponseSuccess} from './plan-response.js';

/**
 * The plan of execution of a search request.
 */
export class ExecutionPlan {
  constructor(private response: PlanResponseSuccess) {}

  /**
   * Gets the final value of the basic expression (`q`) after the search request has been processed in the query pipeline, but before it is sent to the index.
   */
  public get basicExpression() {
    return this.response.parsedInput.basicExpression;
  }

  /**
   * Gets the final value of the large expression (`lq`) after the search request has been processed in the query pipeline, but before it is sent to the index.
   */
  public get largeExpression() {
    return this.response.parsedInput.largeExpression;
  }

  /**
   * Gets the URL to redirect the browser to, if the search request satisfies the condition of a `redirect` trigger rule in the query pipeline.
   *
   * Returns `null` otherwise.
   */
  public get redirectionUrl() {
    const redirects =
      this.response.preprocessingOutput.triggers.filter(isRedirectTrigger);
    return redirects.length ? redirects[0].content : null;
  }
}
