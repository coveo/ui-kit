import {InstantResultsAnalyticsProvider} from '../../api/analytics/instant-result-analytics';
import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  AnalyticsType,
  InstantResultsSearchAction,
  InstantResultsClickAction,
} from '../analytics/analytics-utils';

export const logInstantResultOpen = (
  result: Result
): InstantResultsClickAction =>
  makeAnalyticsAction(
    'analytics/instantResult/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.makeDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    },
    (getState) => new InstantResultsAnalyticsProvider(getState)
  );

export const logInstantResultsSearch = (): InstantResultsSearchAction =>
  makeAnalyticsAction(
    'analytics/instantResult/searchboxAsYouType',
    AnalyticsType.Search,
    (client) => client.makeSearchboxAsYouType(),
    (getState) => new InstantResultsAnalyticsProvider(getState)
  );
