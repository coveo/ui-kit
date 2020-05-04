/**
 * A trigger is an action that the interface will perform (show a message, execute a function, redirect users) depending on the query that was performed.<br/>
 * A trigger that can be configured in the Coveo Query Pipeline.
 */
export type Trigger =
  | TriggerNotify
  | TriggerRedirect
  | TriggerQuery
  | TriggerExecute;

/**
 * Notify (show a message) to a user
 */
export interface TriggerNotify {
  type: 'notify';
  content: string;
}

/**
 * Redirect the user to another url
 */
export interface TriggerRedirect {
  type: 'redirect';
  content: string;
}

export function isTriggerRedirect(
  trigger: Trigger
): trigger is TriggerRedirect {
  return trigger.type === 'redirect';
}

/**
 * Perform a new query with a different query expression
 */
export interface TriggerQuery {
  type: 'query';
  content: string;
}

/**
 * Execute a javascript function present in the page.
 */
export interface TriggerExecute {
  type: 'execute';
  content: {name: string; params: {}[]};
}
