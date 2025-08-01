import type {Trigger} from '../../api/common/trigger.js';
import type {ApplyQueryTriggerModificationPayload} from './triggers-actions.js';
import type {FunctionExecutionTrigger, TriggerState} from './triggers-state.js';

export function handleFetchItemsPending(state: TriggerState) {
  state.query = '';
  state.queryModification = {
    originalQuery: '',
    newQuery: '',
    queryToIgnore: state.queryModification.queryToIgnore,
  };

  return state;
}

export function handleFetchItemsFulfilled(
  state: TriggerState,
  triggers: Trigger[]
) {
  const redirectTriggers: string[] = [];
  const queryTriggers: string[] = [];
  const executeTriggers: FunctionExecutionTrigger[] = [];
  const notifyTriggers: string[] = [];

  triggers.forEach((trigger) => {
    switch (trigger.type) {
      case 'redirect':
        redirectTriggers.push(trigger.content);
        break;
      case 'query':
        queryTriggers.push(trigger.content);
        break;
      case 'execute':
        executeTriggers.push({
          functionName: trigger.content.name,
          params: trigger.content.params,
        });
        break;
      case 'notify':
        notifyTriggers.push(trigger.content);
        break;
    }
  });

  state.redirectTo = redirectTriggers[0] ?? '';
  state.query = state.queryModification.newQuery;
  state.executions = executeTriggers;
  state.notifications = notifyTriggers;

  return state;
}

export function handleApplyQueryTriggerModification(
  state: TriggerState,
  payload: ApplyQueryTriggerModificationPayload
) {
  state.queryModification = {...payload, queryToIgnore: ''};

  return state;
}

export function handleUpdateIgnoreQueryTrigger(
  state: TriggerState,
  payload: string
) {
  state.queryModification.queryToIgnore = payload;

  return state;
}
