import {
  isNullOrUndefined,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {RelayPayload, type createRelay} from '@coveo/relay';
import {
  AsyncThunk,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  CaseAssistClient,
  CoveoInsightClient,
  EventBuilder,
  EventDescription,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {AnalyticsClient} from 'coveo.analytics/dist/definitions/client/analytics';
import {SearchEventResponse} from 'coveo.analytics/dist/definitions/events';
import {
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {Logger} from 'pino';
import {
  configureCaseAssistAnalytics,
  StateNeededByCaseAssistAnalytics,
} from '../../api/analytics/case-assist-analytics';
import {
  StateNeededByCommerceAnalyticsProvider,
  CommerceAnalyticsProvider,
  configureCommerceAnalytics,
} from '../../api/analytics/commerce-analytics';
import {
  configureInsightAnalytics,
  InsightAnalyticsProvider,
  StateNeededByInsightAnalyticsProvider,
} from '../../api/analytics/insight-analytics';
import {StateNeededByInstantResultsAnalyticsProvider} from '../../api/analytics/instant-result-analytics';
import {
  configureProductListingAnalytics,
  ProductListingAnalyticsProvider,
  StateNeededByProductListingAnalyticsProvider,
} from '../../api/analytics/product-listing-analytics';
import {StateNeededByProductRecommendationsAnalyticsProvider} from '../../api/analytics/product-recommendations-analytics';
import {
  configureAnalytics,
  configureLegacyAnalytics,
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from '../../api/analytics/search-analytics';
import {PreprocessRequest} from '../../api/preprocess-request';
import {Raw} from '../../api/search/search/raw';
import {Result} from '../../api/search/search/result';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {ProductRecommendation} from '../../product-listing.index';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {SearchAppState} from '../../state/search-app-state';
import {
  ConfigurationSection,
  PipelineSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {ResultWithFolding} from '../folding/folding-slice';
import {getAllIncludedResultsFrom} from '../folding/folding-utils';
import {getPipelineInitialState} from '../pipeline/pipeline-state';

export interface PreparableAnalyticsActionOptions<
  StateNeeded extends ConfigurationSection,
> {
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  preprocessRequest: PreprocessRequest | undefined;
  logger: Logger;
  getState(): StateNeeded;
}

export type AnalyticsAsyncThunk<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> = AsyncThunk<void, void, AsyncThunkAnalyticsOptions<StateNeeded>>;

export interface PreparedAnalyticsAction<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> {
  description?: EventDescription;
  action: AnalyticsAsyncThunk<StateNeeded>;
}

type PrepareAnalyticsFunction<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> = (
  options: PreparableAnalyticsActionOptions<StateNeeded>
) => Promise<PreparedAnalyticsAction<StateNeeded>>;

export interface PreparableAnalyticsAction<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> extends AnalyticsAsyncThunk<StateNeeded> {
  prepare: PrepareAnalyticsFunction<StateNeeded>;
}

export type SearchAction =
  PreparableAnalyticsAction<StateNeededBySearchAnalyticsProvider>;

export type CustomAction =
  PreparableAnalyticsAction<StateNeededBySearchAnalyticsProvider>;

export type ClickAction =
  PreparableAnalyticsAction<StateNeededBySearchAnalyticsProvider>;

export type InstantResultsSearchAction =
  PreparableAnalyticsAction<StateNeededByInstantResultsAnalyticsProvider>;

export type InstantResultsClickAction =
  PreparableAnalyticsAction<StateNeededByInstantResultsAnalyticsProvider>;

export type InsightAction =
  PreparableAnalyticsAction<StateNeededByInsightAnalyticsProvider>;

export type CaseAssistAction =
  PreparableAnalyticsAction<StateNeededByCaseAssistAnalytics>;

export type ProductRecommendationAction =
  PreparableAnalyticsAction<StateNeededByProductRecommendationsAnalyticsProvider>;

export type ProductListingAction =
  PreparableAnalyticsAction<StateNeededByProductListingAnalyticsProvider>;

export type ProductListingV2Action =
  PreparableAnalyticsAction<StateNeededByCommerceAnalyticsProvider>;

export interface AsyncThunkAnalyticsOptions<
  T extends StateNeededBySearchAnalyticsProvider,
> {
  state: T;
  extra: ThunkExtraArguments;
}

export interface AsyncThunkInsightAnalyticsOptions<
  T extends Partial<StateNeededByInsightAnalyticsProvider>,
> {
  state: T;
  extra: ThunkExtraArguments;
}

function makeInstantlyCallable<T extends object>(action: T) {
  return Object.assign(action, {instantlyCallable: true}) as T;
}

function makePreparableAnalyticsAction<
  EventType extends void,
  StateNeeded extends ConfigurationSection,
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
): PreparableAnalyticsAction<StateNeeded> {
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
      >(prefix, body) as unknown as AnalyticsAsyncThunk<StateNeeded>
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

  const prepare: PrepareAnalyticsFunction<StateNeeded> = async ({
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

  return rootAction as PreparableAnalyticsAction<StateNeeded>;
}

export type AnalyticsActionOptions<
  LegacyStateNeeded extends StateNeededBySearchAnalyticsProvider,
  StateNeeded extends StateNeededBySearchAnalyticsProvider,
  Client,
  PayloadType extends RelayPayload,
> = LegacyAnalyticsOptions<LegacyStateNeeded, Client> &
  Partial<NextAnalyticsOptions<StateNeeded, PayloadType>>;

export interface NextAnalyticsOptions<
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType extends RelayPayload,
> {
  analyticsType: string;
  analyticsPayloadBuilder: (state: StateNeeded) => PayloadType;
}
export interface LegacyAnalyticsOptions<
  StateNeeded extends InternalLegacyStateNeeded,
  Client,
> {
  prefix: string;
  __legacy__getBuilder: (
    client: Client,
    state: StateNeeded
  ) => Promise<EventBuilder | null> | null;
  __legacy__provider?: (
    getState: () => StateNeeded
  ) => SearchPageClientProvider;
}

export function makeAnalyticsAction<
  LegacyStateNeeded extends
    StateNeededBySearchAnalyticsProvider = StateNeededBySearchAnalyticsProvider,
  ComputedLegacyAnalyticsOptions extends LegacyAnalyticsOptions<
    LegacyStateNeeded,
    CoveoSearchPageClient
  > = LegacyAnalyticsOptions<LegacyStateNeeded, CoveoSearchPageClient>,
>(
  prefix: string,
  __legacy__getBuilder: ComputedLegacyAnalyticsOptions['__legacy__getBuilder'],
  __legacy__provider?: ComputedLegacyAnalyticsOptions['__legacy__provider']
): PreparableAnalyticsAction<LegacyStateNeeded>;
export function makeAnalyticsAction<
  LegacyStateNeeded extends
    StateNeededBySearchAnalyticsProvider = StateNeededBySearchAnalyticsProvider,
  StateNeeded extends
    StateNeededBySearchAnalyticsProvider = StateNeededBySearchAnalyticsProvider,
  PayloadType extends RelayPayload = RelayPayload,
>({
  prefix,
  __legacy__getBuilder,
  __legacy__provider,
  analyticsPayloadBuilder,
  analyticsType,
}: AnalyticsActionOptions<
  LegacyStateNeeded,
  StateNeeded,
  CoveoSearchPageClient,
  PayloadType
>): PreparableAnalyticsAction<StateNeeded>;
export function makeAnalyticsAction<
  LegacyStateNeeded extends
    StateNeededBySearchAnalyticsProvider = StateNeededBySearchAnalyticsProvider,
  ComputedLegacyAnalyticsOptions extends LegacyAnalyticsOptions<
    LegacyStateNeeded,
    CoveoSearchPageClient
  > = LegacyAnalyticsOptions<LegacyStateNeeded, CoveoSearchPageClient>,
  StateNeeded extends
    StateNeededBySearchAnalyticsProvider = StateNeededBySearchAnalyticsProvider,
  PayloadType extends RelayPayload = RelayPayload,
>(
  ...params:
    | [
        ComputedLegacyAnalyticsOptions['prefix'],
        ComputedLegacyAnalyticsOptions['__legacy__getBuilder'],
        ComputedLegacyAnalyticsOptions['__legacy__provider']?,
      ]
    | [
        AnalyticsActionOptions<
          LegacyStateNeeded,
          StateNeeded,
          CoveoSearchPageClient,
          PayloadType
        >,
      ]
): PreparableAnalyticsAction<LegacyStateNeeded & StateNeeded> {
  const options =
    params.length === 1
      ? {
          ...params[0],
          analyticsConfigurator: configureLegacyAnalytics,
        }
      : {
          prefix: params[0],
          __legacy__getBuilder: params[1],
          __legacy__provider: params[2],
          analyticsConfigurator: configureLegacyAnalytics,
        };
  return internalMakeAnalyticsAction(options);
}

const shouldSendLegacyEvent = (state: ConfigurationSection) =>
  state.configuration.analytics.analyticsMode === 'legacy';
const shouldSendNextEvent = (state: ConfigurationSection) =>
  state.configuration.analytics.analyticsMode === 'next';

type CommonClient = {coveoAnalyticsClient: AnalyticsClient};

type AnalyticsConfiguratorFromStateNeeded<
  StateNeeded extends InternalLegacyStateNeeded,
  ReturnType extends CommonClient,
> = (options: AnalyticsConfiguratorOptions<StateNeeded>) => ReturnType;
interface AnalyticsConfiguratorOptions<
  StateNeeded extends InternalLegacyStateNeeded,
> {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: SearchPageClientProvider;
  getState(): StateNeeded;
}

type InternalMakeAnalyticsActionOptions<
  LegacyStateNeeded extends InternalLegacyStateNeeded,
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType extends RelayPayload,
  AnalyticsConfigurator extends AnalyticsConfiguratorFromStateNeeded<
    LegacyStateNeeded,
    Client
  >,
  Client extends CommonClient,
> = LegacyAnalyticsOptions<LegacyStateNeeded, Client> &
  Partial<NextAnalyticsOptions<StateNeeded, PayloadType>> & {
    analyticsConfigurator: AnalyticsConfigurator;
  };

type InternalLegacyStateNeeded =
  | StateNeededBySearchAnalyticsProvider
  | StateNeededByProductListingAnalyticsProvider
  | StateNeededByCaseAssistAnalytics;

const internalMakeAnalyticsAction = <
  LegacyStateNeeded extends InternalLegacyStateNeeded,
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType extends RelayPayload,
  Client extends CommonClient,
>({
  prefix,
  __legacy__getBuilder,
  __legacy__provider,
  analyticsPayloadBuilder,
  analyticsType,
  analyticsConfigurator,
}: InternalMakeAnalyticsActionOptions<
  LegacyStateNeeded,
  StateNeeded,
  PayloadType,
  AnalyticsConfiguratorFromStateNeeded<LegacyStateNeeded, Client>,
  Client
>): PreparableAnalyticsAction<LegacyStateNeeded & StateNeeded> => {
  __legacy__provider ??= (getState) => new SearchAnalyticsProvider(getState);
  return makePreparableAnalyticsAction(
    prefix,
    async ({
      getState,
      analyticsClientMiddleware,
      preprocessRequest,
      logger,
    }) => {
      const loggers: ((
        state: LegacyStateNeeded & StateNeeded
      ) => Promise<void>)[] = [];
      const analyticsAction: {
        log: (
          options: AsyncThunkAnalyticsOptions<LegacyStateNeeded & StateNeeded>
        ) => Promise<void>;
        description?: EventDescription;
      } = {
        log: async ({state}) => {
          for (const log of loggers) {
            await log(state);
          }
        },
      };
      const state = getState();
      const client = analyticsConfigurator({
        getState,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: __legacy__provider!(getState),
      });
      const builder = await __legacy__getBuilder(client, getState());
      analyticsAction.description = builder?.description;
      loggers.push(async (state: LegacyStateNeeded & StateNeeded) => {
        if (shouldSendLegacyEvent(state)) {
          await logLegacyEvent<LegacyStateNeeded>(
            builder,
            __legacy__provider,
            state,
            logger,
            client.coveoAnalyticsClient
          );
        }
      });
      const emitEvent = configureAnalytics(state);
      loggers.push(async (state: LegacyStateNeeded & StateNeeded) => {
        if (
          shouldSendNextEvent(state) &&
          analyticsType &&
          analyticsPayloadBuilder
        ) {
          const payload = analyticsPayloadBuilder(state);
          await logNextEvent(emitEvent, analyticsType, payload);
        }
      });
      return analyticsAction;
    }
  );
};

async function logLegacyEvent<StateNeeded extends InternalLegacyStateNeeded>(
  builder: EventBuilder | null,
  __legacy__provider:
    | ((getState: () => StateNeeded) => SearchPageClientProvider)
    | undefined,
  state: StateNeeded,
  logger: Logger,
  client: AnalyticsClient
) {
  const response = await builder?.log({
    searchUID: __legacy__provider!(() => state).getSearchUID(),
  });
  logger.info({client, response}, 'Analytics response');
}

export const makeNoopAnalyticsAction = () =>
  makeAnalyticsAction('analytics/noop', () => null);

export const noopSearchAnalyticsAction = (): SearchAction =>
  makeNoopAnalyticsAction();

const fromLogToLegacyBuilder =
  <Client extends CommonClient, StateNeeded>(
    log: (
      client: Client,
      state: StateNeeded
    ) => Promise<void | SearchEventResponse> | void | null
  ): ((client: Client, state: StateNeeded) => Promise<EventBuilder>) =>
  (client, state) =>
    Promise.resolve({
      description: {actionCause: 'caseAssist'},
      log: async (_metadata: {searchUID: string}) => {
        log(client, state);
      },
    });

export const makeCaseAssistAnalyticsAction = (
  prefix: string,
  log: (
    client: CaseAssistClient,
    state: StateNeededByCaseAssistAnalytics
  ) => Promise<void | SearchEventResponse> | void
): PreparableAnalyticsAction<StateNeededByCaseAssistAnalytics> => {
  return internalMakeAnalyticsAction({
    prefix,
    __legacy__getBuilder: fromLogToLegacyBuilder(log),
    analyticsConfigurator: configureCaseAssistAnalytics,
  });
};

export const makeInsightAnalyticsAction = (
  prefix: string,
  log: (
    client: CoveoInsightClient,
    state: StateNeededByInsightAnalyticsProvider
  ) => Promise<void | SearchEventResponse> | void | null,
  provider: (
    getState: () => StateNeededByInsightAnalyticsProvider
  ) => InsightAnalyticsProvider = (getState) =>
    new InsightAnalyticsProvider(getState)
): PreparableAnalyticsAction<StateNeededBySearchAnalyticsProvider> => {
  return internalMakeAnalyticsAction({
    prefix,
    __legacy__getBuilder: fromLogToLegacyBuilder(log),
    analyticsConfigurator: configureInsightAnalytics,
    __legacy__provider: provider,
  });
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

export const productRecommendationPartialDefinition = {
  permanentid: requiredNonEmptyString,
  documentUri: requiredNonEmptyString,
  clickUri: requiredNonEmptyString,
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
  results: ResultWithFolding[] | Result[] = []
) {
  return results.findIndex(({uniqueId}) => uniqueId === targetResult.uniqueId);
}

export const validateProductRecommendationPayload = (
  productRec: ProductRecommendation
) => new Schema(productRecommendationPartialDefinition).validate(productRec);

export const makeProductListingAnalyticsAction = <
  StateNeeded extends
    StateNeededByProductListingAnalyticsProvider = StateNeededByProductListingAnalyticsProvider,
>(
  prefix: string,
  getBuilder: (
    client: CoveoSearchPageClient,
    state: StateNeeded
  ) => Promise<EventBuilder | null> | null,
  provider: (getState: () => StateNeeded) => SearchPageClientProvider = (
    getState
  ) => new ProductListingAnalyticsProvider(getState)
): PreparableAnalyticsAction<StateNeeded> => {
  const options = {
    prefix,
    __legacy__getBuilder: getBuilder,
    __legacy__provider: provider,
    analyticsConfigurator: configureProductListingAnalytics,
  };
  return internalMakeAnalyticsAction(options);
};

export const makeCommerceAnalyticsAction = <
  StateNeeded extends
    StateNeededByCommerceAnalyticsProvider = StateNeededByCommerceAnalyticsProvider,
>(
  prefix: string,
  getBuilder: (
    client: CoveoSearchPageClient,
    state: StateNeeded
  ) => Promise<EventBuilder | null> | null,
  provider: (
    getState: () => StateNeededByCommerceAnalyticsProvider
  ) => SearchPageClientProvider = (getState) =>
    new CommerceAnalyticsProvider(getState)
): PreparableAnalyticsAction<StateNeeded> => {
  const options = {
    prefix,
    __legacy__getBuilder: getBuilder,
    __legacy__provider: provider,
    analyticsConfigurator: configureCommerceAnalytics,
  };
  return internalMakeAnalyticsAction(options);
};

async function logNextEvent<PayloadType extends RelayPayload>(
  emitEvent: ReturnType<typeof createRelay>['emit'],
  type: string,
  payload: PayloadType
): Promise<void> {
  await emitEvent(type, payload);
  return;
}
