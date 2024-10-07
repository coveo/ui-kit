import {RecordValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {SearchAction} from '../search/search-actions.js';

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

export const logTriggerQuery = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/trigger/query', (client, state) => {
    if (state.triggers?.queryModification.newQuery) {
      return client.makeTriggerQuery();
    }
    return null;
  });

//TODO: KIT-2859
export const logUndoTriggerQuery = (
  payload: LogUndoTriggerQueryActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/trigger/query/undo', (client) => {
    validatePayload(payload, logUndoTriggerQueryPayloadDefinition);
    return client.makeUndoTriggerQuery(payload);
  });

export const logNotifyTrigger = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/trigger/notify', (client, state) => {
    if (!state.triggers?.notifications.length) {
      return null;
    }
    return client.makeTriggerNotify({
      notifications: state.triggers.notifications,
    });
  });

export const logTriggerRedirect = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/trigger/redirect', (client, state) => {
    if (state.triggers?.redirectTo) {
      return client.makeTriggerRedirect({
        redirectedTo: state.triggers.redirectTo,
      });
    }
    return null;
  });

export const logTriggerExecute = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/trigger/execute', (client, state) => {
    if (!state.triggers?.executions.length) {
      return null;
    }
    return client.makeTriggerExecute({
      executions: state.triggers.executions,
    });
  });

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const undoTriggerQuery = (): SearchAction => ({
  actionCause: SearchPageEvents.undoTriggerQuery,
});
