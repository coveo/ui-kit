import {createAsyncThunk, AsyncThunkAction} from '@reduxjs/toolkit';
import {configureAnalytics} from '../../api/analytics/analytics';
import {
  SearchPageEvents,
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchPageState} from '../../state';
import {Result} from '../../api/search/search/result';

export const searchPageState = (getState: () => unknown) =>
  getState() as SearchPageState;

export enum AnalyticsType {
  Search,
  Custom,
  Click,
}

export type SearchAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Search},
  void | {},
  {}
>;

export type CustomAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Custom},
  {},
  {}
>;

export type ClickAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Click},
  {},
  {}
>;

export const makeSearchActionType = () => ({
  analyticsType: AnalyticsType.Search as AnalyticsType.Search,
});

export const makeClickActionType = () => ({
  analyticsType: AnalyticsType.Click as AnalyticsType.Click,
});

export interface GenericSearchEventPayload {
  evt: SearchPageEvents | string;
  meta?: Record<string, any>;
}

/**
 * Log generic search event
 */
export const logGenericSearchEvent = createAsyncThunk(
  'analytics/generic/search',
  async (p: GenericSearchEventPayload, {getState}) => {
    //TODO: Validate payload
    const {evt, meta} = p;
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchEvent(
      evt as SearchPageEvents,
      meta
    );
    return makeSearchActionType();
  }
);

export const partialDocumentInformation = (
  result: Result,
  state: SearchPageState
): PartialDocumentInformation => {
  const resultIndex = state.search.response.results.findIndex(
    ({uniqueId}) => result.uniqueId === uniqueId
  );
  return {
    collectionName: result.raw['collection'] || 'default',
    documentAuthor: result.raw['author'] as string,
    documentPosition: resultIndex + 1,
    documentTitle: result.title,
    documentUri: result.uri,
    documentUriHash: result.raw['urihash'],
    documentUrl: result.clickUri,
    rankingModifier: result.rankingModifier || '',
    sourceName: result.raw['source'],
    queryPipeline: state.pipeline,
  };
};

export const documentIdentifier = (result: Result): DocumentIdentifier => {
  return {
    contentIDKey: '@permanentid',
    contentIDValue: result.raw.permanentid,
  };
};
