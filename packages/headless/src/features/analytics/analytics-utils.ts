import {
  isNullOrUndefined,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {Relay} from '@coveo/relay';
import {Base, ItemMetaData} from '@coveo/relay-event-types';
import {
  AsyncThunk,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {
  type EventBuilder,
  type EventDescription,
  type AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {Logger} from 'pino';
import {
  StateNeededByCaseAssistAnalytics,
} from '../../api/analytics/case-assist-analytics';
import {
  StateNeededByCommerceAnalyticsProvider,
} from '../../api/analytics/commerce-analytics';
import {
  StateNeededByInsightAnalyticsProvider,
} from '../../api/analytics/insight-analytics';
import {StateNeededByInstantResultsAnalyticsProvider} from '../../api/analytics/instant-result-analytics';
import {
  StateNeededByProductListingAnalyticsProvider,
} from '../../api/analytics/product-listing-analytics';
import {StateNeededByProductRecommendationsAnalyticsProvider} from '../../api/analytics/product-recommendations-analytics';
import {
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from '../../api/analytics/search-analytics';
import {PreprocessRequest} from '../../api/preprocess-request';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {Raw} from '../../api/search/search/raw';
import {Result} from '../../api/search/search/result';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
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
> extends AnalyticsAsyncThunk<StateNeeded> {}

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
  extra: ThunkExtraArguments & {relay: Relay};
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

export type AnalyticsActionOptions<
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

// const makeAnalyticsActionFactory = <
//   LegacyStateNeededByProvider extends InternalLegacyStateNeeded,
//   StateNeededByProvider extends InternalLegacyStateNeeded,
//   Client extends CommonClient,
//   LegacyProvider extends LegacyProviderCommon,
//   LegacyGetBuilderType = LegacyAnalyticsOptions<
//     LegacyStateNeededByProvider,
//     Client,
//     LegacyProvider
//   >['__legacy__getBuilder'],
//   Configurator extends AnalyticsConfiguratorFromStateNeeded<
//     LegacyStateNeededByProvider,
//     Client,
//     LegacyProvider
//   > = AnalyticsConfiguratorFromStateNeeded<
//     LegacyStateNeededByProvider,
//     Client,
//     LegacyProvider
//   >,
// >(
//   configurator: Configurator,
//   legacyGetBuilderConverter: (
//     original: LegacyGetBuilderType
//   ) => LegacyAnalyticsOptions<
//     LegacyStateNeededByProvider,
//     Client,
//     LegacyProvider
//   >['__legacy__getBuilder'],
//   providerClass: ProviderClass<LegacyStateNeededByProvider, LegacyProvider>
// ) => {
//   function makeAnalyticsAction<
//     LegacyStateNeeded extends
//       LegacyStateNeededByProvider = LegacyStateNeededByProvider,
//     ComputedLegacyAnalyticsOptions extends LegacyAnalyticsOptions<
//       LegacyStateNeeded,
//       Client,
//       LegacyProvider
//     > = LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider>,
//   >(
//     prefix: string,
//     __legacy__getBuilder: LegacyGetBuilderType,
//     __legacy__provider?: ComputedLegacyAnalyticsOptions['__legacy__provider']
//   ): PreparableAnalyticsAction<LegacyStateNeeded>;
//   function makeAnalyticsAction<
//     LegacyStateNeeded extends
//       LegacyStateNeededByProvider = LegacyStateNeededByProvider,
//     StateNeeded extends StateNeededByProvider = StateNeededByProvider,
//     PayloadType = {},
//   >({
//     prefix,
//     __legacy__getBuilder,
//     __legacy__provider,
//     analyticsPayloadBuilder,
//     analyticsType,
//   }: AnalyticsActionOptions<
//     LegacyStateNeeded,
//     StateNeeded,
//     LegacyGetBuilderType,
//     LegacyProvider,
//     Client,
//     PayloadType
//   >): PreparableAnalyticsAction<StateNeeded>;
//   function makeAnalyticsAction<
//     LegacyStateNeeded extends
//       LegacyStateNeededByProvider = LegacyStateNeededByProvider,
//     ComputedLegacyAnalyticsOptions extends LegacyAnalyticsOptions<
//       LegacyStateNeeded,
//       Client,
//       LegacyProvider
//     > = LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider>,
//     StateNeeded extends StateNeededByProvider = StateNeededByProvider,
//     PayloadType = {},
//   >(
//     ...params:
//       | [
//           ComputedLegacyAnalyticsOptions['prefix'],
//           LegacyGetBuilderType,
//           ComputedLegacyAnalyticsOptions['__legacy__provider']?,
//         ]
//       | [
//           AnalyticsActionOptions<
//             LegacyStateNeeded,
//             StateNeeded,
//             LegacyGetBuilderType,
//             LegacyProvider,
//             Client,
//             PayloadType
//           >,
//         ]
//   ): PreparableAnalyticsAction<LegacyStateNeeded & StateNeeded> {
//     return internalMakeAnalyticsAction(options);
//   }
//   return makeAnalyticsAction;
// };

// type InternalMakeAnalyticsActionOptions<
//   LegacyStateNeeded extends InternalLegacyStateNeeded,
//   StateNeeded extends InternalLegacyStateNeeded,
//   PayloadType,
//   AnalyticsConfigurator extends AnalyticsConfiguratorFromStateNeeded<
//     LegacyStateNeeded,
//     Client,
//     LegacyProvider
//   >,
//   Client extends CommonClient,
//   LegacyProvider,
// > = LegacyAnalyticsOptions<LegacyStateNeeded, Client, LegacyProvider> &
//   Partial<NextAnalyticsOptions<StateNeeded, PayloadType>> & {
//     analyticsConfigurator: AnalyticsConfigurator;
//   } & {
//     providerClass: ProviderClass<LegacyStateNeeded, LegacyProvider>;
//   };

type InternalLegacyStateNeeded =
  | StateNeededBySearchAnalyticsProvider
  | StateNeededByProductListingAnalyticsProvider
  | StateNeededByCaseAssistAnalytics;

interface ClientProvider {
  [key: string]: (...args: any[]) => any;
}

interface AnalyticsDefinition<S extends StateNeededBySearchAnalyticsProvider> {
  prefix: string;
  __legacy__getBuilder?: (client: ClientProvider, state: any) => any;
  __legacy__provider?: (...args: any[]) => any;
  analyticsType: string;
  analyticsPayloadBuilder: (state: S) => Base;
}

export const makeAnalyticsAction = <S extends ConfigurationSection>(
  definition: AnalyticsDefinition<S>
) => {
  return createAsyncThunk<void, void, AsyncThunkAnalyticsOptions<S>>(
    definition.prefix,
    async (_action, {getState, extra}) => {
      const state = getState();
      const {relay} = extra;
      const payload = definition.analyticsPayloadBuilder(state);
      relay.emit(definition.analyticsType, payload);
    }
  );
};

// export const makeCaseAssistAnalyticsAction = makeAnalyticsActionFactory<
//   StateNeededByCaseAssistAnalytics,
//   StateNeededByCaseAssistAnalytics,
//   CaseAssistClient,
//   CaseAssistAnalyticsProvider,
//   LogFunction<CaseAssistClient, StateNeededByCaseAssistAnalytics>
// >(
//   configureCaseAssistAnalytics,
//   fromLogToLegacyBuilder,
//   CaseAssistAnalyticsProvider
// );

// export const makeInsightAnalyticsAction = makeAnalyticsActionFactory<
//   StateNeededByInsightAnalyticsProvider,
//   StateNeededByInsightAnalyticsProvider,
//   CoveoInsightClient,
//   InsightAnalyticsProvider,
//   LogFunction<CoveoInsightClient, StateNeededByInsightAnalyticsProvider>
// >(configureInsightAnalytics, fromLogToLegacyBuilder, InsightAnalyticsProvider);

// export const makeCommerceAnalyticsAction = makeAnalyticsActionFactory<
//   StateNeededByCommerceAnalyticsProvider,
//   StateNeededByCommerceAnalyticsProvider,
//   CoveoSearchPageClient,
//   CommerceAnalyticsProvider
// >(
//   configureCommerceAnalytics,
//   (original) => original,
//   CommerceAnalyticsProvider
// );

// export const makeProductListingAnalyticsAction = makeAnalyticsActionFactory<
//   StateNeededByProductListingAnalyticsProvider,
//   StateNeededByProductListingAnalyticsProvider,
//   CoveoSearchPageClient,
//   ProductListingAnalyticsProvider
// >(
//   configureProductListingAnalytics,
//   (original) => original,
//   ProductListingAnalyticsProvider
// );

export const makeNoopAnalyticsAction = () =>
  makeAnalyticsAction({
    prefix: 'analytics/noop',
    analyticsType: 'noop',
    analyticsPayloadBuilder: () => ({}),
  });

export const noopSearchAnalyticsAction = (): LegacySearchAction =>
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
