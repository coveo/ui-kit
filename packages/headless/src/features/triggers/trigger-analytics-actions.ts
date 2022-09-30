import {RecordValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';

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
  makeAnalyticsAction(
    'analytics/trigger/query',
    AnalyticsType.Search,
    (client, state) => {
      if (state.triggers?.queryModification.newQuery) {
        return client.makeTriggerQuery();
      }
      return null;
    }
  );

export const logUndoTriggerQuery = (
  payload: LogUndoTriggerQueryActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction(
    'analytics/trigger/query/undo',
    AnalyticsType.Search,
    (client) => {
      validatePayload(payload, logUndoTriggerQueryPayloadDefinition);
      return client.makeUndoTriggerQuery(payload);
    }
  );

export const logNotifyTrigger = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/trigger/notify',
    AnalyticsType.Search,
    (client, state) => {
      if (state.triggers?.notification) {
        return client.makeTriggerNotify({
          notification: state.triggers.notification,
        });
      }
      return null;
    }
  );

export const logTriggerRedirect = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/trigger/redirect',
    AnalyticsType.Search,
    (client, state) => {
      if (state.triggers?.redirectTo) {
        return client.makeTriggerRedirect({
          redirectedTo: state.triggers.redirectTo,
        });
      }
      return null;
    }
  );

/**
 * Log trigger execute
 */
export const logTriggerExecute = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/trigger/execute',
    AnalyticsType.Search,
    (client, state) => {
      if (state.triggers?.execute) {
        return client.makeTriggerExecute({
          executed: state.triggers.execute.functionName,
        });
      }
      return null;
    }
  );
