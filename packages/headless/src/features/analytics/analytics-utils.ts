import {Result} from '../../api/search/search/result';
import {
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../state/search-app-state';
import {getPipelineInitialState} from '../pipeline/pipeline-state';
import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {Raw} from '../../api/search/search/raw';
import {
  AnalyticsProvider,
  configureAnalytics,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {
  AnalyticsClientSendEventHook,
  CoveoSearchPageClient,
  SearchPageClientProvider,
} from 'coveo.analytics';
import {SearchEventResponse} from 'coveo.analytics/dist/definitions/events';
import {AsyncThunkAction, createAsyncThunk} from '@reduxjs/toolkit';

export enum AnalyticsType {
  Search,
  Custom,
  Click,
}

export type SearchAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Search},
  void | {},
  AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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

const searchPageState = (getState: () => unknown) =>
  getState() as SearchAppState;

export interface AsyncThunkAnalyticsOptions<
  T extends Partial<StateNeededByAnalyticsProvider>
> {
  state: T;
  extra: {
    analyticsClientMiddleware: AnalyticsClientSendEventHook;
  };
}

export const makeAnalyticsAction = <T extends AnalyticsType>(
  prefix: string,
  analyticsType: T,
  log: (
    client: CoveoSearchPageClient,
    state: Partial<SearchAppState>
  ) => Promise<void | SearchEventResponse> | void,
  provider: (state: Partial<SearchAppState>) => SearchPageClientProvider = (
    s
  ) => new AnalyticsProvider(s as StateNeededByAnalyticsProvider)
) => {
  return createAsyncThunk<
    {analyticsType: T},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >(prefix, async (_, {getState, extra: {analyticsClientMiddleware}}) => {
    const state = searchPageState(getState);
    const client = configureAnalytics(
      state,
      analyticsClientMiddleware,
      provider(state)
    );
    await log(client, state);
    return {analyticsType};
  });
};

export const partialDocumentInformation = (
  result: Result,
  state: Partial<SearchAppState>
): PartialDocumentInformation => {
  const resultIndex =
    state.search?.response.results.findIndex(
      ({uniqueId}) => result.uniqueId === uniqueId
    ) || 0;
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
    queryPipeline: state.pipeline || getPipelineInitialState(),
  };
};

export const documentIdentifier = (result: Result): DocumentIdentifier => {
  return {
    contentIDKey: '@permanentid',
    contentIDValue: result.raw.permanentid,
  };
};

const requiredNonEmptyString = new StringValue({
  required: true,
  emptyAllowed: false,
});

const rawPartialDefinition = {
  collection: requiredNonEmptyString,
  author: requiredNonEmptyString,
  urihash: requiredNonEmptyString,
  source: requiredNonEmptyString,
  permanentid: requiredNonEmptyString,
};

const resultPartialDefinition = {
  uniqueId: requiredNonEmptyString,
  raw: new RecordValue({values: rawPartialDefinition}),
  title: requiredNonEmptyString,
  uri: new StringValue({required: true, emptyAllowed: false, url: true}),
  clickUri: new StringValue({required: true, emptyAllowed: false, url: true}),
  rankingModifier: new StringValue({required: false, emptyAllowed: true}),
};

function partialRawPayload(raw: Raw): Partial<Raw> {
  return Object.assign(
    {},
    ...Object.keys(rawPartialDefinition).map((key) => ({[key]: raw[key]}))
  );
}

function partialResultPayload(result: Result): Partial<Result> {
  return Object.assign(
    {},
    ...Object.keys(resultPartialDefinition).map((key) => ({
      [key]: result[key as keyof typeof resultPartialDefinition],
    })),
    {raw: partialRawPayload(result.raw)}
  );
}

export const validateResultPayload = (result: Result) =>
  new Schema(resultPartialDefinition).validate(partialResultPayload(result));
