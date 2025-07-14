import type {ItemClick} from '@coveo/relay-event-types';
import {RecommendationAnalyticsProvider} from '../../api/analytics/recommendations-analytics.js';
import type {Result} from '../../api/search/search/result.js';
import {
  type ClickAction,
  documentIdentifier,
  type LegacySearchAction,
  makeAnalyticsAction,
  partialRecommendationInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {SearchAction} from '../search/search-actions.js';

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
      const docInfo = partialRecommendationInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        responseId: result.searchUid ?? '',
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
