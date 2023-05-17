import {
  isNullOrUndefined,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {
  AsyncThunk,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
  EventDescription,
  AnalyticsClientSendEventHook,
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics';
import type {Logger} from 'pino';
import type {StateNeededByInstantResultsAnalyticsProvider} from '../../api/analytics/instant-result-analytics';
import type {StateNeededByProductListingAnalyticsProvider} from '../../api/analytics/product-listing-analytics';
import type {StateNeededByProductRecommendationsAnalyticsProvider} from '../../api/analytics/product-recommendations-analytics';
import type {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import type {PreprocessRequest} from '../../api/preprocess-request';
import type {Raw} from '../../api/search/search/raw';
import type {Result} from '../../api/search/search/result';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import type {RecommendationAppState} from '../../state/recommendation-app-state';
import type {SearchAppState} from '../../state/search-app-state';
import type {
  ConfigurationSection,
  PipelineSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import type {ResultWithFolding} from '../folding/folding-slice';
import {getAllIncludedResultsFrom} from '../folding/folding-utils';
import {getPipelineInitialState} from '../pipeline/pipeline-state';

export enum AnalyticsType {
  Search,
  Custom,
  Click,
}

export interface PreparableAnalyticsActionOptions<
  StateNeeded extends ConfigurationSection
> {
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  preprocessRequest: PreprocessRequest | undefined;
  logger: Logger;
  getState(): StateNeeded;
}

export type WrappedAnalyticsType<T extends AnalyticsType = AnalyticsType> = {
  analyticsType: T;
};

export type AnalyticsAsyncThunk<
  EventType extends WrappedAnalyticsType | void,
  StateNeeded extends ConfigurationSection = StateNeededBySearchAnalyticsProvider
> = AsyncThunk<
  EventType extends void ? void : EventType,
  void,
  AsyncThunkAnalyticsOptions<StateNeeded>
>;

export interface PreparedAnalyticsAction<
  EventType extends WrappedAnalyticsType | void,
  StateNeeded extends ConfigurationSection = StateNeededBySearchAnalyticsProvider
> {
  description?: EventDescription;
  action: AnalyticsAsyncThunk<EventType, StateNeeded>;
}

type PrepareAnalyticsFunction<
  EventType extends WrappedAnalyticsType | void,
  StateNeeded extends ConfigurationSection = StateNeededBySearchAnalyticsProvider
> = (
  options: PreparableAnalyticsActionOptions<StateNeeded>
) => Promise<PreparedAnalyticsAction<EventType, StateNeeded>>;

export interface PreparableAnalyticsAction<
  EventType extends WrappedAnalyticsType | void,
  StateNeeded extends ConfigurationSection = StateNeededBySearchAnalyticsProvider
> extends AnalyticsAsyncThunk<EventType, StateNeeded> {
  prepare: PrepareAnalyticsFunction<EventType, StateNeeded>;
}

export type SearchAction = PreparableAnalyticsAction<
  {analyticsType: AnalyticsType.Search},
  StateNeededBySearchAnalyticsProvider
>;

export type CustomAction = PreparableAnalyticsAction<
  {analyticsType: AnalyticsType.Custom},
  StateNeededBySearchAnalyticsProvider
>;

export type ClickAction = PreparableAnalyticsAction<
  {analyticsType: AnalyticsType.Click},
  StateNeededBySearchAnalyticsProvider
>;

export type InstantResultsSearchAction = PreparableAnalyticsAction<
  {analyticsType: AnalyticsType.Search},
  StateNeededByInstantResultsAnalyticsProvider
>;

export type InstantResultsClickAction = PreparableAnalyticsAction<
  {analyticsType: AnalyticsType.Click},
  StateNeededByInstantResultsAnalyticsProvider
>;

export type ProductRecommendationAction<
  T extends AnalyticsType = AnalyticsType.Search
> = PreparableAnalyticsAction<
  {analyticsType: T},
  StateNeededByProductRecommendationsAnalyticsProvider
>;

export type ProductListingAction<
  T extends AnalyticsType = AnalyticsType.Search
> = PreparableAnalyticsAction<
  {analyticsType: T},
  StateNeededByProductListingAnalyticsProvider
>;

export interface AsyncThunkAnalyticsOptions<
  T extends StateNeededBySearchAnalyticsProvider
> {
  state: T;
  extra: ThunkExtraArguments;
}

function makeInstantlyCallable<T extends object>(action: T) {
  return Object.assign(action, {instantlyCallable: true}) as T;
}

export function makePreparableAnalyticsAction<
  EventType extends WrappedAnalyticsType | void,
  StateNeeded extends ConfigurationSection
>(
  prefix: string,
  buildEvent: (
    options: PreparableAnalyticsActionOptions<StateNeeded>
  ) => Promise<{
    log: (
      options: AsyncThunkAnalyticsOptions<StateNeeded>
    ) => Promise<EventType>;
    description?: EventDescription;
  }>
): PreparableAnalyticsAction<EventType, StateNeeded> {
  const createAnalyticsAction = (
    body: AsyncThunkPayloadCreator<
      EventType,
      void,
      AsyncThunkAnalyticsOptions<StateNeeded>
    >
  ) =>
    makeInstantlyCallable(
      createAsyncThunk<
        EventType,
        void,
        AsyncThunkAnalyticsOptions<StateNeeded>
      >(prefix, body) as unknown as AnalyticsAsyncThunk<EventType, StateNeeded>
    );

  const rootAction = createAnalyticsAction(async (_, {getState, extra}) => {
    const {analyticsClientMiddleware, preprocessRequest, logger} = extra;
    return await (
      await buildEvent({
        getState,
        analyticsClientMiddleware,
        preprocessRequest,
        logger,
      })
    ).log({state: getState(), extra});
  });

  const prepare: PrepareAnalyticsFunction<EventType, StateNeeded> = async ({
    getState,
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  }) => {
    const {description, log} = await buildEvent({
      getState,
      analyticsClientMiddleware,
      preprocessRequest,
      logger,
    });
    return {
      description,
      action: createAnalyticsAction(
        async (_, {getState: getNewState, extra: newExtra}) => {
          return await log({state: getNewState(), extra: newExtra});
        }
      ),
    };
  };

  Object.assign(rootAction, {
    prepare,
  });

  return rootAction as PreparableAnalyticsAction<EventType, StateNeeded>;
}

export const partialDocumentInformation = (
  result: Result,
  state: Partial<SearchAppState>
): PartialDocumentInformation => {
  const paginationBasedIndex = (index: number) =>
    index + (state.pagination?.firstResult ?? 0);

  let resultIndex = -1;

  const parentResults = state.search?.results as ResultWithFolding[];
  resultIndex = findPositionWithUniqueId(result, parentResults);

  if (resultIndex < 0) {
    resultIndex = findPositionInChildResults(result, parentResults);
  }

  if (resultIndex < 0) {
    // ¯\_(ツ)_/¯
    resultIndex = 0;
  }

  return buildPartialDocumentInformation(
    result,
    paginationBasedIndex(resultIndex),
    state
  );
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
  if (!result.raw.permanentid) {
    console.warn(
      'Missing field permanentid on result. This might cause many issues with your Coveo deployment. See https://docs.coveo.com/en/1913 and https://docs.coveo.com/en/1640 for more information.',
      result
    );
  }
  return {
    contentIDKey: 'permanentid',
    contentIDValue: result.raw.permanentid || '',
  };
};

const rawPartialDefinition = {
  urihash: new StringValue(),
  sourcetype: new StringValue(),
  permanentid: new StringValue(),
};

export const resultPartialDefinition = {
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

function findPositionInChildResults(
  targetResult: Result,
  parentResults: ResultWithFolding[]
) {
  for (const [i, parent] of parentResults.entries()) {
    const children = getAllIncludedResultsFrom(parent);
    const childIndex = findPositionWithUniqueId(targetResult, children);
    if (childIndex !== -1) {
      return i;
    }
  }

  return -1;
}

function findPositionWithUniqueId(
  targetResult: Result,
  results: ResultWithFolding[] = []
) {
  return results.findIndex(({uniqueId}) => uniqueId === targetResult.uniqueId);
}
