import {
  isNullOrUndefined,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {type createRelay} from '@coveo/relay';
import {
  AsyncThunk,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
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
  CaseAssistAnalyticsProvider,
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

export function makeBasicNewSearchAnalyticsAction(
  actionCause: string,
  getState: () => StateNeededBySearchAnalyticsProvider
) {
  return {
    ...new SearchAnalyticsProvider(getState).getBaseMetadata(),
    actionCause,
    type: actionCause,
  };
}

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
  LegacyGetBuilderType,
  LegacyProvider,
  Client,
  PayloadType,
> = Exclude<
  LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider>,
  '__legacy__getBuilder'
> &
  Partial<NextAnalyticsOptions<StateNeeded, PayloadType>> & {
    __legacy__getBuilder: LegacyGetBuilderType;
  };

export interface NextAnalyticsOptions<
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType,
> {
  analyticsType: string;
  analyticsPayloadBuilder: (state: StateNeeded) => PayloadType;
}
export interface LegacyAnalyticsOptions<
  StateNeeded extends InternalLegacyStateNeeded,
  Client,
  Provider,
> {
  prefix: string;
  __legacy__getBuilder: (
    client: Client,
    state: StateNeeded
  ) => Promise<EventBuilder | null> | null;
  __legacy__provider?: (getState: () => StateNeeded) => Provider;
}

interface ProviderClass<StateNeeded, LegacyProvider> {
  new (param: () => StateNeeded): LegacyProvider;
}

const makeAnalyticsActionFactory = <
  LegacyStateNeededByProvider extends InternalLegacyStateNeeded,
  StateNeededByProvider extends InternalLegacyStateNeeded,
  Client extends CommonClient,
  LegacyProvider extends LegacyProviderCommon,
  LegacyGetBuilderType = LegacyAnalyticsOptions<
    LegacyStateNeededByProvider,
    Client,
    LegacyProvider
  >['__legacy__getBuilder'],
  Configurator extends AnalyticsConfiguratorFromStateNeeded<
    LegacyStateNeededByProvider,
    Client,
    LegacyProvider
  > = AnalyticsConfiguratorFromStateNeeded<
    LegacyStateNeededByProvider,
    Client,
    LegacyProvider
  >,
>(
  configurator: Configurator,
  legacyGetBuilderConverter: (
    original: LegacyGetBuilderType
  ) => LegacyAnalyticsOptions<
    LegacyStateNeededByProvider,
    Client,
    LegacyProvider
  >['__legacy__getBuilder'],
  providerClass: ProviderClass<LegacyStateNeededByProvider, LegacyProvider>
) => {
  function makeAnalyticsAction<
    LegacyStateNeeded extends
      LegacyStateNeededByProvider = LegacyStateNeededByProvider,
    ComputedLegacyAnalyticsOptions extends LegacyAnalyticsOptions<
      LegacyStateNeeded,
      Client,
      LegacyProvider
    > = LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider>,
  >(
    prefix: string,
    __legacy__getBuilder: LegacyGetBuilderType,
    __legacy__provider?: ComputedLegacyAnalyticsOptions['__legacy__provider']
  ): PreparableAnalyticsAction<LegacyStateNeeded>;
  function makeAnalyticsAction<
    LegacyStateNeeded extends
      LegacyStateNeededByProvider = LegacyStateNeededByProvider,
    StateNeeded extends StateNeededByProvider = StateNeededByProvider,
    PayloadType = {},
  >({
    prefix,
    __legacy__getBuilder,
    __legacy__provider,
    analyticsPayloadBuilder,
    analyticsType,
  }: AnalyticsActionOptions<
    LegacyStateNeeded,
    StateNeeded,
    LegacyGetBuilderType,
    LegacyProvider,
    Client,
    PayloadType
  >): PreparableAnalyticsAction<StateNeeded>;
  function makeAnalyticsAction<
    LegacyStateNeeded extends
      LegacyStateNeededByProvider = LegacyStateNeededByProvider,
    ComputedLegacyAnalyticsOptions extends LegacyAnalyticsOptions<
      LegacyStateNeeded,
      Client,
      LegacyProvider
    > = LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider>,
    StateNeeded extends StateNeededByProvider = StateNeededByProvider,
    PayloadType = {},
  >(
    ...params:
      | [
          ComputedLegacyAnalyticsOptions['prefix'],
          LegacyGetBuilderType,
          ComputedLegacyAnalyticsOptions['__legacy__provider']?,
        ]
      | [
          AnalyticsActionOptions<
            LegacyStateNeeded,
            StateNeeded,
            LegacyGetBuilderType,
            LegacyProvider,
            Client,
            PayloadType
          >,
        ]
  ): PreparableAnalyticsAction<LegacyStateNeeded & StateNeeded> {
    const options =
      params.length === 1
        ? {
            ...params[0],
            __legacy__getBuilder: legacyGetBuilderConverter(
              params[0].__legacy__getBuilder
            ),
            analyticsConfigurator: configurator,
            providerClass: providerClass,
          }
        : {
            prefix: params[0],
            __legacy__getBuilder: legacyGetBuilderConverter(params[1]),
            __legacy__provider: params[2],
            analyticsConfigurator: configurator,
            providerClass: providerClass,
          };
    return internalMakeAnalyticsAction(options);
  }
  return makeAnalyticsAction;
};

const shouldSendLegacyEvent = (state: ConfigurationSection) =>
  state.configuration.analytics.analyticsMode === 'legacy';
const shouldSendNextEvent = (state: ConfigurationSection) =>
  state.configuration.analytics.analyticsMode === 'next';

type CommonClient = {coveoAnalyticsClient: AnalyticsClient};

type AnalyticsConfiguratorFromStateNeeded<
  StateNeeded extends InternalLegacyStateNeeded,
  ReturnType extends CommonClient,
  LegacyProvider,
> = (
  options: AnalyticsConfiguratorOptions<StateNeeded, LegacyProvider>
) => ReturnType;
interface AnalyticsConfiguratorOptions<
  StateNeeded extends InternalLegacyStateNeeded,
  LegacyProvider,
> {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: LegacyProvider;
  getState(): StateNeeded;
}

type InternalMakeAnalyticsActionOptions<
  LegacyStateNeeded extends InternalLegacyStateNeeded,
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType,
  AnalyticsConfigurator extends AnalyticsConfiguratorFromStateNeeded<
    LegacyStateNeeded,
    Client,
    LegacyProvider
  >,
  Client extends CommonClient,
  LegacyProvider,
> = LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider> &
  Partial<NextAnalyticsOptions<StateNeeded, PayloadType>> & {
    analyticsConfigurator: AnalyticsConfigurator;
  } & {
    providerClass: ProviderClass<LegacyStateNeeded, LegacyProvider>;
  };

type InternalLegacyStateNeeded =
  | StateNeededBySearchAnalyticsProvider
  | StateNeededByProductListingAnalyticsProvider
  | StateNeededByCaseAssistAnalytics;

interface LegacyProviderCommon {
  getSearchUID: () => string;
}

const internalMakeAnalyticsAction = <
  LegacyStateNeeded extends InternalLegacyStateNeeded,
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType,
  Client extends CommonClient,
  LegacyProvider extends LegacyProviderCommon,
>({
  prefix,
  __legacy__getBuilder,
  __legacy__provider,
  analyticsPayloadBuilder,
  analyticsType,
  analyticsConfigurator,
  providerClass,
}: InternalMakeAnalyticsActionOptions<
  LegacyStateNeeded,
  StateNeeded,
  PayloadType,
  AnalyticsConfiguratorFromStateNeeded<
    LegacyStateNeeded,
    Client,
    LegacyProvider
  >,
  Client,
  LegacyProvider
>): PreparableAnalyticsAction<LegacyStateNeeded & StateNeeded> => {
  __legacy__provider ??= (getState) => new providerClass(getState);
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
          await logLegacyEvent<LegacyStateNeeded, LegacyProvider>(
            builder,
            __legacy__provider!,
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

async function logLegacyEvent<
  StateNeeded extends InternalLegacyStateNeeded,
  Provider extends LegacyProviderCommon,
>(
  builder: EventBuilder | null,
  __legacy__provider: (getState: () => StateNeeded) => Provider,
  state: StateNeeded,
  logger: Logger,
  client: AnalyticsClient
) {
  __legacy__provider(() => state);
  const response = await builder?.log({
    searchUID: __legacy__provider!(() => state).getSearchUID(),
  });
  logger.info({client, response}, 'Analytics response');
}

type LogFunction<Client, StateNeeded> = (
  client: Client,
  state: StateNeeded
) => Promise<void | SearchEventResponse> | void | null;

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

export const makeAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededBySearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
  CoveoSearchPageClient,
  SearchPageClientProvider
>(configureLegacyAnalytics, (original) => original, SearchAnalyticsProvider);

export const makeCaseAssistAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededByCaseAssistAnalytics,
  StateNeededByCaseAssistAnalytics,
  CaseAssistClient,
  CaseAssistAnalyticsProvider,
  LogFunction<CaseAssistClient, StateNeededByCaseAssistAnalytics>
>(
  configureCaseAssistAnalytics,
  fromLogToLegacyBuilder,
  CaseAssistAnalyticsProvider
);

export const makeInsightAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededByInsightAnalyticsProvider,
  StateNeededByInsightAnalyticsProvider,
  CoveoInsightClient,
  InsightAnalyticsProvider,
  LogFunction<CoveoInsightClient, StateNeededByInsightAnalyticsProvider>
>(configureInsightAnalytics, fromLogToLegacyBuilder, InsightAnalyticsProvider);

export const makeCommerceAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededByCommerceAnalyticsProvider,
  StateNeededByCommerceAnalyticsProvider,
  CoveoSearchPageClient,
  CommerceAnalyticsProvider
>(
  configureCommerceAnalytics,
  (original) => original,
  CommerceAnalyticsProvider
);

export const makeProductListingAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededByProductListingAnalyticsProvider,
  StateNeededByProductListingAnalyticsProvider,
  CoveoSearchPageClient,
  ProductListingAnalyticsProvider
>(
  configureProductListingAnalytics,
  (original) => original,
  ProductListingAnalyticsProvider
);

export const makeNoopAnalyticsAction = () =>
  makeAnalyticsAction('analytics/noop', () => null);

export const noopSearchAnalyticsAction = (): SearchAction =>
  makeNoopAnalyticsAction();

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

async function logNextEvent<PayloadType>(
  emitEvent: ReturnType<typeof createRelay>['emit'],
  type: string,
  payload: PayloadType
): Promise<void> {
  //@ts-expect-error will be fixed when relay updates
  await emitEvent(type, payload);
  return;
}
