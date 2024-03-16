import {RecordValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

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

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const undoTriggerQuery = (): SearchAction => ({
  actionCause: SearchPageEvents.undoTriggerQuery,
});
