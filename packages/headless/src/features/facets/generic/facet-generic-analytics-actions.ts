import {AnalyticsType, SearchAction} from '../../analytics/analytics-utils';
import {makeAnalyticsAction} from '../../analytics/search-analytics-utils';

export const logClearBreadcrumbs = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.makeBreadcrumbResetAll();
    }
  );
