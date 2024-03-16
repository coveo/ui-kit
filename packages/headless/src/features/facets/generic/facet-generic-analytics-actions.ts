import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';

export const breadcrumbResetAll = (): SearchAction => ({
  actionCause: SearchPageEvents.breadcrumbResetAll,
});
