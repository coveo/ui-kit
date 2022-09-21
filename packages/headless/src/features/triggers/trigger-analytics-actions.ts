import {RecordValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

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

export const logTriggerQuery = makeAnalyticsAction(
  'analytics/trigger/query',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.queryModification.newQuery) {
      return client.logTriggerQuery();
    }
    return;
  }
);

export const logUndoTriggerQuery = (
  payload: LogUndoTriggerQueryActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/trigger/query/undo',
    AnalyticsType.Search,
    (client) => {
      validatePayload(payload, logUndoTriggerQueryPayloadDefinition);
      client.logUndoTriggerQuery(payload);
    }
  )();

export const logNotifyTrigger = makeAnalyticsAction(
  'analytics/trigger/notify',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.notifications.length) {
      return client.logTriggerNotify({
        notification: state.triggers.notifications[0],
      });
    }
    return;
  }
);

export const logTriggerRedirect = makeAnalyticsAction(
  'analytics/trigger/redirect',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.redirectTo) {
      return client.logTriggerRedirect({
        redirectedTo: state.triggers.redirectTo,
      });
    }
    return;
  }
);

/**
 * Log trigger execute
 */
export const logTriggerExecute = makeAnalyticsAction(
  'analytics/trigger/execute',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.executions.length) {
      return client.logTriggerExecute({
        executed: state.triggers.executions[0].functionName,
      });
    }
    return;
  }
);
