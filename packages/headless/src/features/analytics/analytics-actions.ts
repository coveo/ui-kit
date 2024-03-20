import {SearchPageEvents as LegacySearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {Result} from '../../api/search/search/result';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';
import {SearchAction} from '../search/search-actions';
import {
  ClickAction,
  CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  LegacySearchAction,
  validateResultPayload,
} from './analytics-utils';
import {SearchPageEvents} from './search-action-cause';
// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const interfaceLoad = (): SearchAction => ({
  actionCause: SearchPageEvents.interfaceLoad,
});

export const interfaceChange = (): SearchAction => ({
  actionCause: SearchPageEvents.interfaceChange,
});

export const searchFromLink = (): SearchAction => ({
  actionCause: SearchPageEvents.searchFromLink,
});

export const omniboxFromLink = (): SearchAction => ({
  actionCause: SearchPageEvents.omniboxFromLink,
});
