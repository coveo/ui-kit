import {RecordValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';
import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';

export interface LogUndoTriggerQueryActionCreatorPayload {
  /**
   * The query that was undone.
   */
  undoneQuery: string;
}

const logUndoTriggerQueryPayloadDefinition = new RecordValue({
  values: {
    undoneQuery: requiredEmptyAllowedString,
  },
  options: {required: true},
});

export const logTriggerQuery = (): SearchAction =>
  makeAnalyticsAction('analytics/trigger/query', (client, state) => {
    if (state.triggers?.queryModification.newQuery) {
      return client.makeTriggerQuery();
    }
    return null;
  });

export const logUndoTriggerQuery = (
  payload: LogUndoTriggerQueryActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction('analytics/trigger/query/undo', (client) => {
    validatePayload(payload, logUndoTriggerQueryPayloadDefinition);
    return client.makeUndoTriggerQuery(payload);
  });

export const logNotifyTrigger = (): SearchAction =>
  makeAnalyticsAction('analytics/trigger/notify', (client, state) => {
    if (!state.triggers?.notifications.length) {
      return null;
    }
    return client.makeTriggerNotify({
      notifications: state.triggers.notifications,
    });
  });

export const logTriggerRedirect = (): SearchAction =>
  makeAnalyticsAction('analytics/trigger/redirect', (client, state) => {
    if (state.triggers?.redirectTo) {
      return client.makeTriggerRedirect({
        redirectedTo: state.triggers.redirectTo,
      });
    }
    return null;
  });

/**
 * Log trigger execute
 */
export const logTriggerExecute = (): SearchAction =>
  makeAnalyticsAction('analytics/trigger/execute', (client, state) => {
    if (!state.triggers?.executions.length) {
      return null;
    }
    return client.makeTriggerExecute({
      executions: state.triggers.executions,
    });
  });
