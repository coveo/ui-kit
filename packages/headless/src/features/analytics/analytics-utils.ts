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
  CoveoSearchPageClient,
  SearchPageClientProvider,
  CaseAssistClient,
  CoveoInsightClient,
  EventBuilder,
  EventDescription,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {
  AsyncThunk,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  ConfigurationSection,
  PipelineSection,
} from '../../state/state-sections';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {ResultWithFolding} from '../folding/folding-slice';
import {getAllIncludedResultsFrom} from '../folding/folding-utils';
import {
  configureAnalytics,
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from '../../api/analytics/search-analytics';
import {
  configureCaseAssistAnalytics,
  StateNeededByCaseAssistAnalytics,
} from '../../api/analytics/case-assist-analytics';
import {InsightAppState} from '../../state/insight-app-state';
import {
  configureInsightAnalytics,
  InsightAnalyticsProvider,
  StateNeededByInsightAnalyticsProvider,
} from '../../api/analytics/insight-analytics';
import {PreprocessRequest} from '../../api/preprocess-request';
import {Logger} from 'pino';
import {SearchEventResponse} from 'coveo.analytics/dist/definitions/events';
import {StateNeededByProductRecommendationsAnalyticsProvider} from '../../api/analytics/product-recommendations-analytics';

export enum AnalyticsType {
  Search,
  Custom,
  Click,
}

export interface PreparableAnalyticsActionOptions<
  StateNeeded extends ConfigurationSection
> {
  state: StateNeeded;
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  preprocessRequest: PreprocessRequest | undefined;
  logger: Logger;
}

type WrappedAnalyticsType<T extends AnalyticsType = AnalyticsType> = {
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
) => PreparedAnalyticsAction<EventType, StateNeeded>;

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

export type InsightAction<T extends AnalyticsType = AnalyticsType.Search> =
  PreparableAnalyticsAction<
    {analyticsType: T},
    StateNeededByInsightAnalyticsProvider
  >;

export type CaseAssistAction = PreparableAnalyticsAction<
  void,
  StateNeededByCaseAssistAnalytics
>;

export type ProductRecommendationAction<
  T extends AnalyticsType = AnalyticsType.Search
> = PreparableAnalyticsAction<
  {analyticsType: T},
  StateNeededByProductRecommendationsAnalyticsProvider
>;

export interface AsyncThunkAnalyticsOptions<
  T extends StateNeededBySearchAnalyticsProvider
> {
  state: T;
  extra: ThunkExtraArguments;
}

export interface AsyncThunkInsightAnalyticsOptions<
  T extends Partial<StateNeededByInsightAnalyticsProvider>
> {
  state: T;
  extra: ThunkExtraArguments;
}

function makeInstantlyCallable<T extends object>(action: T) {
  return Object.assign(action, {instantlyCallable: true}) as T;
}

function makePreparableAnalyticsAction<
  EventType extends WrappedAnalyticsType | void,
  StateNeeded extends ConfigurationSection
>(
  prefix: string,
  buildEvent: (options: PreparableAnalyticsActionOptions<StateNeeded>) => {
    log: () => Promise<EventType>;
    description?: EventDescription;
  }
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

  const rootAction = createAnalyticsAction(
    async (
      _,
      {getState, extra: {analyticsClientMiddleware, preprocessRequest, logger}}
    ) => {
      return await buildEvent({
        state: getState(),
        analyticsClientMiddleware,
        preprocessRequest,
        logger,
      }).log();
    }
  );

  const prepare: PrepareAnalyticsFunction<EventType, StateNeeded> = ({
    state,
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  }) => {
    const {description, log} = buildEvent({
      state,
      analyticsClientMiddleware,
      preprocessRequest,
      logger,
    });
    return {
      description,
      action: createAnalyticsAction(async () => {
        return await log();
      }),
    };
  };

  Object.assign(rootAction, {
    prepare,
  });

  return rootAction as PreparableAnalyticsAction<EventType, StateNeeded>;
}

export const makeAnalyticsAction = <EventType extends AnalyticsType>(
  prefix: string,
  analyticsType: EventType,
  getBuilder: (
    client: CoveoSearchPageClient,
    state: StateNeededBySearchAnalyticsProvider
  ) => EventBuilder | null,
  provider: (state: Partial<SearchAppState>) => SearchPageClientProvider = (
    s
  ) => new SearchAnalyticsProvider(s as StateNeededBySearchAnalyticsProvider)
): PreparableAnalyticsAction<
  WrappedAnalyticsType<EventType>,
  StateNeededBySearchAnalyticsProvider
> => {
  return makePreparableAnalyticsAction(
    prefix,
    ({state, analyticsClientMiddleware, preprocessRequest, logger}) => {
      const client = configureAnalytics({
        state,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: provider(state),
      });
      const builder = getBuilder(client, state);
      return {
        description: builder?.description,
        log: async () => {
          const response = await builder?.log();
          logger.info(
            {client: client.coveoAnalyticsClient, response},
            'Analytics response'
          );
          return {analyticsType};
        },
      };
    }
  );
};

export const makeNoopAnalyticsAction = <T extends AnalyticsType>(
  analyticsType: T
) => makeAnalyticsAction('analytics/noop', analyticsType, () => null);

export const noopSearchAnalyticsAction = (): SearchAction =>
  makeNoopAnalyticsAction(AnalyticsType.Search);

export const makeCaseAssistAnalyticsAction = (
  prefix: string,
  log: (
    client: CaseAssistClient,
    state: StateNeededByCaseAssistAnalytics
  ) => Promise<void | SearchEventResponse> | void
): PreparableAnalyticsAction<void, StateNeededByCaseAssistAnalytics> => {
  return makePreparableAnalyticsAction(
    prefix,
    ({state, analyticsClientMiddleware, preprocessRequest, logger}) => {
      const client = configureCaseAssistAnalytics({
        state,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
      });
      return {
        log: async () => {
          const response = await log(client, state);
          logger.info(
            {client: client.coveoAnalyticsClient, response},
            'Analytics response'
          );
        },
      };
    }
  );
};

export const makeInsightAnalyticsAction = <EventType extends AnalyticsType>(
  prefix: string,
  analyticsType: EventType,
  log: (
    client: CoveoInsightClient,
    state: StateNeededByInsightAnalyticsProvider
  ) => Promise<void | SearchEventResponse> | void,
  provider: (state: Partial<InsightAppState>) => InsightAnalyticsProvider = (
    s
  ) => new InsightAnalyticsProvider(s as StateNeededByInsightAnalyticsProvider)
): PreparableAnalyticsAction<
  WrappedAnalyticsType<EventType>,
  StateNeededBySearchAnalyticsProvider
> => {
  return makePreparableAnalyticsAction(
    prefix,
    ({state, analyticsClientMiddleware, preprocessRequest, logger}) => {
      const client = configureInsightAnalytics({
        state,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: provider(state),
      });
      return {
        log: async () => {
          const response = await log(client, state);
          logger.info(
            {client: client.coveoAnalyticsClient, response},
            'Analytics response'
          );
          return {analyticsType};
        },
      };
    }
  );
};

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
