import {Result} from '../../api/search/search/result';
import {
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../state/search-app-state';
import {getPipelineInitialState} from '../pipeline/pipeline-state';
import {
  isNullOrUndefined,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {Raw} from '../../api/search/search/raw';
import {
  AnalyticsProvider,
  configureAnalytics,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {CoveoSearchPageClient, SearchPageClientProvider} from 'coveo.analytics';
import {SearchEventResponse} from 'coveo.analytics/dist/definitions/events';
import {AsyncThunkAction, createAsyncThunk} from '@reduxjs/toolkit';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {PipelineSection} from '../../state/state-sections';
import {RecommendationAppState} from '../../state/recommendation-app-state';

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
  extra: ThunkExtraArguments;
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
  >(
    prefix,
    async (
      _,
      {getState, extra: {analyticsClientMiddleware, preprocessRequest, logger}}
    ) => {
      const state = searchPageState(getState);
      const client = configureAnalytics({
        state,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: provider(state),
      });
      const response = await log(client, state);
      logger.info(
        {client: client.coveoAnalyticsClient, response},
        'Analytics response'
      );
      return {analyticsType};
    }
  );
};

export const makeNoopAnalyticsAction = <T extends AnalyticsType>(
  analyticsType: T
) => {
  return createAsyncThunk<
    {analyticsType: T},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >('analytics/noop', async () => {
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

  return buildPartialDocumentInformation(result, resultIndex, state);
};

export const partialRecommendationInformation = (
  result: Result,
  state: Partial<RecommendationAppState>
): PartialDocumentInformation => {
  const resultIndex =
    state.recommendation?.recommendations.findIndex(
      ({uniqueId}) => result.uniqueId === uniqueId
    ) || 0;

  return buildPartialDocumentInformation(result, resultIndex, state);
};

function buildPartialDocumentInformation(
  result: Result,
  resultIndex: number,
  state: Partial<PipelineSection>
): PartialDocumentInformation {
  const collection = result.raw.collection;
  const collectionName =
    typeof collection === 'string' ? collection : 'default';

  return {
    collectionName,
    documentAuthor: getDocumentAuthor(result),
    documentPosition: resultIndex + 1,
    documentTitle: result.title,
    documentUri: result.uri,
    documentUriHash: result.raw.urihash,
    documentUrl: result.clickUri,
    rankingModifier: result.rankingModifier || '',
    sourceName: getSourceName(result),
    queryPipeline: state.pipeline || getPipelineInitialState(),
  };
}

export const documentIdentifier = (result: Result): DocumentIdentifier => {
  return {
    contentIDKey: '@permanentid',
    contentIDValue: result.raw.permanentid || '',
  };
};

const rawPartialDefinition = {
  urihash: new StringValue(),
  sourcetype: new StringValue(),
  permanentid: new StringValue(),
};

const resultPartialDefinition = {
  uniqueId: requiredNonEmptyString,
  raw: new RecordValue({values: rawPartialDefinition}),
  title: requiredNonEmptyString,
  uri: requiredNonEmptyString,
  clickUri: requiredNonEmptyString,
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

function getDocumentAuthor(result: Result) {
  const author = result.raw['author'];
  if (isNullOrUndefined(author)) {
    return 'unknown';
  }

  return Array.isArray(author) ? author.join(';') : `${author}`;
}

function getSourceName(result: Result) {
  const source = result.raw['source'];
  if (isNullOrUndefined(source)) {
    return 'unknown';
  }
  return source;
}

export const validateResultPayload = (result: Result) =>
  new Schema(resultPartialDefinition).validate(partialResultPayload(result));
