import {ItemClick} from '@coveo/relay-event-types';
import {
  InstantResultsAnalyticsProvider,
  StateNeededByInstantResultsAnalyticsProvider,
} from '../../api/analytics/instant-result-analytics';
import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  InstantResultsSearchAction,
  InstantResultsClickAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

export const logInstantResultOpen = (
  result: Result
): InstantResultsClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/instantResult/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      return client.makeDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    },
    __legacy__provider: (
      getState: () => StateNeededByInstantResultsAnalyticsProvider
    ) => new InstantResultsAnalyticsProvider(getState),

    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const docInfo = partialDocumentInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        searchUid: state.search?.response.searchUid ?? '',
        position: docInfo.documentPosition,
        actionCause: 'open',
        itemMetadata: {
          uniqueFieldName: docId.contentIDKey,
          uniqueFieldValue: docId.contentIDValue,
          title: docInfo.documentTitle,
          author: docInfo.documentAuthor,
          url: docInfo.documentUrl,
        },
      };
    },
  });

//TODO: KIT-2859
export const logInstantResultsSearch = (): InstantResultsSearchAction =>
  makeAnalyticsAction(
    'analytics/instantResult/searchboxAsYouType',
    (client) => client.makeSearchboxAsYouType(),
    (getState) => new InstantResultsAnalyticsProvider(getState)
  );

export const searchboxAsYouType = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.searchboxAsYouType,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};
