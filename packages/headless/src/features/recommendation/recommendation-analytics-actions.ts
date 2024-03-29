import {ItemClick} from '@coveo/relay-event-types';
import {RecommendationAnalyticsProvider} from '../../api/analytics/recommendations-analytics';
import {Result} from '../../api/search/search/result';
import {
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  partialRecommendationInformation,
  LegacySearchAction,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

//TODO: KIT-2859
export const logRecommendationUpdate = (): LegacySearchAction =>
  makeAnalyticsAction(
    'analytics/recommendation/update',
    (client) => client.makeRecommendationInterfaceLoad(),
    (getState) => new RecommendationAnalyticsProvider(getState)
  );

export const recommendationInterfaceLoad = (): SearchAction => ({
  actionCause: SearchPageEvents.recommendationInterfaceLoad,
});

export const logRecommendationOpen = (result: Result): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/recommendation/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      return client.makeRecommendationOpen(
        partialRecommendationInformation(result, state),
        documentIdentifier(result)
      );
    },
    __legacy__provider: (getState) =>
      new RecommendationAnalyticsProvider(getState),

    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const docInfo = partialDocumentInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        searchUid: state.search?.response.searchUid ?? '',
        position: docInfo.documentPosition,
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
