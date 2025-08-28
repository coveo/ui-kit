/** biome-ignore-all lint/suspicious/noConfusingVoidType: <> */
import {
  isNullOrUndefined,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import type {createRelay} from '@coveo/relay';
import type {ItemMetaData} from '@coveo/relay-event-types';
import {
  type AsyncThunk,
  type AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
  AnalyticsClientSendEventHook,
  CaseAssistClient,
  CoveoInsightClient,
  CoveoSearchPageClient,
  EventBuilder,
  EventDescription,
  SearchPageClientProvider,
} from 'coveo.analytics';
import type {AnalyticsClient} from 'coveo.analytics/dist/definitions/client/analytics.js';
import type {SearchEventResponse} from 'coveo.analytics/dist/definitions/events.js';
import type {
  DocumentIdentifier,
  PartialDocumentInformation,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import type {Logger} from 'pino';
import {getRelayInstanceFromState} from '../../api/analytics/analytics-relay-client.js';
import {
  CaseAssistAnalyticsProvider,
  configureCaseAssistAnalytics,
  type StateNeededByCaseAssistAnalytics,
} from '../../api/analytics/case-assist-analytics.js';
import {
  configureInsightAnalytics,
  InsightAnalyticsProvider,
  type StateNeededByInsightAnalyticsProvider,
} from '../../api/analytics/insight-analytics.js';
import type {StateNeededByInstantResultsAnalyticsProvider} from '../../api/analytics/instant-result-analytics.js';
import {
  configureLegacyAnalytics,
  SearchAnalyticsProvider,
  type StateNeededBySearchAnalyticsProvider,
} from '../../api/analytics/search-analytics.js';
import type {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';
import type {PreprocessRequest} from '../../api/preprocess-request.js';
import type {Raw} from '../../api/search/search/raw.js';
import type {Result} from '../../api/search/search/result.js';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import type {RecommendationAppState} from '../../state/recommendation-app-state.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import type {
  ConfigurationSection,
  PipelineSection,
} from '../../state/state-sections.js';
import {requiredNonEmptyString} from '../../utils/validate-payload.js';
import type {ResultWithFolding} from '../folding/folding-slice.js';
import {getAllIncludedResultsFrom} from '../folding/folding-utils.js';
import {getPipelineInitialState} from '../pipeline/pipeline-state.js';

type PreparableAnalyticsActionOptions<
  StateNeeded extends ConfigurationSection,
> = {
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  preprocessRequest: PreprocessRequest | undefined;
  logger: Logger;
  getState(): StateNeeded;
};

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

type PreparedAnalyticsAction<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> = {
  description?: EventDescription;
  action: AnalyticsAsyncThunk<StateNeeded>;
};

type PrepareAnalyticsFunction<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> = (
  options: PreparableAnalyticsActionOptions<StateNeeded>
) => Promise<PreparedAnalyticsAction<StateNeeded>>;

type PreparableAnalyticsAction<
  StateNeeded extends
    ConfigurationSection = StateNeededBySearchAnalyticsProvider,
> = AnalyticsAsyncThunk<StateNeeded> & {
  prepare: PrepareAnalyticsFunction<StateNeeded>;
};

export type LegacySearchAction =
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

type AsyncThunkAnalyticsOptions<
  T extends StateNeededBySearchAnalyticsProvider,
> = {
  state: T;
  extra: ThunkExtraArguments;
};

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

type AnalyticsActionOptions<
  LegacyStateNeeded extends StateNeededBySearchAnalyticsProvider,
  StateNeeded extends StateNeededBySearchAnalyticsProvider,
  LegacyGetBuilderType,
  LegacyProvider,
  Client,
  PayloadType,
> = Omit<
  LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider>,
  '__legacy__getBuilder'
> &
  Partial<NextAnalyticsOptions<StateNeeded, PayloadType>> & {
    __legacy__getBuilder: LegacyGetBuilderType;
  };

interface NextAnalyticsOptions<
  StateNeeded extends InternalLegacyStateNeeded,
  PayloadType,
> {
  analyticsType: string;
  analyticsPayloadBuilder: (state: StateNeeded) => PayloadType;
}
interface LegacyAnalyticsOptions<
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
      const {emit} = getRelayInstanceFromState(state);
      loggers.push(async (state: LegacyStateNeeded & StateNeeded) => {
        if (
          shouldSendNextEvent(state) &&
          analyticsType &&
          analyticsPayloadBuilder
        ) {
          const payload = analyticsPayloadBuilder(state);
          await logNextEvent(emit, analyticsType, payload);
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

const fromLogToLegacyBuilderFactory = (actionCause: string) => {
  const fromLogToLegacyBuilder = <Client extends CommonClient, StateNeeded>(
    log: (
      client: Client,
      state: StateNeeded
    ) => Promise<void | SearchEventResponse> | void | null
  ): ((client: Client, state: StateNeeded) => Promise<EventBuilder>) => {
    return (client, state) =>
      Promise.resolve({
        description: {actionCause: actionCause},
        log: async (_metadata: {searchUID: string}) => {
          log(client, state);
        },
      });
  };
  return fromLogToLegacyBuilder;
};

export const makeAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededBySearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
  CoveoSearchPageClient,
  SearchPageClientProvider
>(
  (options) =>
    configureLegacyAnalytics({
      ...options,
      provider:
        options.provider || new SearchAnalyticsProvider(options.getState),
    }),
  (original) => original,
  SearchAnalyticsProvider
);

export const makeCaseAssistAnalyticsAction = makeAnalyticsActionFactory<
  StateNeededByCaseAssistAnalytics,
  StateNeededByCaseAssistAnalytics,
  CaseAssistClient,
  CaseAssistAnalyticsProvider,
  LogFunction<CaseAssistClient, StateNeededByCaseAssistAnalytics>
>(
  configureCaseAssistAnalytics,
  fromLogToLegacyBuilderFactory('caseAssist'),
  CaseAssistAnalyticsProvider
);

export const makeInsightAnalyticsActionFactory = (actionCause: string) => {
  const makeInsightAnalyticsAction = makeAnalyticsActionFactory<
    StateNeededByInsightAnalyticsProvider,
    StateNeededByInsightAnalyticsProvider,
    CoveoInsightClient,
    InsightAnalyticsProvider,
    LogFunction<CoveoInsightClient, StateNeededByInsightAnalyticsProvider>
  >(
    configureInsightAnalytics,
    fromLogToLegacyBuilderFactory(actionCause),
    InsightAnalyticsProvider
  );
  return makeInsightAnalyticsAction;
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

export const partialCitationInformation = (
  citation: GeneratedAnswerCitation,
  state: Partial<SearchAppState>
): PartialDocumentInformation => {
  return {
    sourceName: getCitationSourceName(citation),
    documentPosition: 1,
    documentTitle: citation.title,
    documentUri: citation.uri,
    documentUrl: citation.clickUri,
    queryPipeline: state.pipeline || getPipelineInitialState(),
  };
};

function getCitationSourceName(citation: GeneratedAnswerCitation) {
  const source = citation.source;
  if (isNullOrUndefined(source)) {
    return 'unknown';
  }
  return source;
}

export const citationDocumentIdentifier = (
  citation: GeneratedAnswerCitation
) => {
  return {
    contentIdKey: 'permanentid',
    contentIdValue: citation.permanentid || '',
  };
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
  const author = result.raw.author;
  if (isNullOrUndefined(author)) {
    return 'unknown';
  }

  return Array.isArray(author) ? author.join(';') : `${author}`;
}

function getSourceName(result: Result) {
  const source = result.raw.source;
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

async function logNextEvent<PayloadType>(
  emitEvent: ReturnType<typeof createRelay>['emit'],
  type: string,
  payload: PayloadType
): Promise<void> {
  //@ts-expect-error will be fixed when relay updates
  await emitEvent(type, payload);
  return;
}

export const analyticsEventItemMetadata = (
  result: Result,
  state: Partial<SearchAppState>
): ItemMetaData => {
  const identifier = documentIdentifier(result);
  const information = partialDocumentInformation(result, state);
  return {
    uniqueFieldName: identifier.contentIDKey,
    uniqueFieldValue: identifier.contentIDValue,
    title: information.documentTitle,
    author: information.documentAuthor,
    url: information.documentUri,
  };
};
