import {isNullOrUndefined} from '@coveo/bueno';
import type {AnyAction} from '@reduxjs/toolkit';
import type {ThunkDispatch} from 'redux-thunk';
import type {StateNeededBySearchAnalyticsProvider} from '../../../api/analytics/search-analytics.js';
import type {SearchRequest} from '../../../api/search/search/search-request.js';
import type {SearchResponseSuccess} from '../../../api/search/search/search-response.js';
import {
  isErrorResponse,
  isSuccessResponse,
  type SearchAPIClient,
} from '../../../api/search/search-api-client.js';
import type {SearchAPIErrorWithStatusCode} from '../../../api/search/search-api-error-response.js';
import type {SearchOrigin} from '../../../api/search/search-metadata.js';
import type {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import type {
  AdvancedSearchQueriesSection,
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  DebugSection,
  DidYouMeanSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSection,
  FieldsSection,
  FoldingSection,
  NumericFacetSection,
  PaginationSection,
  PipelineSection,
  QuerySection,
  QuerySetSection,
  SearchHubSection,
  SearchSection,
  SortSection,
  TriggerSection,
} from '../../../state/state-sections.js';
import type {AnalyticsAsyncThunk} from '../../analytics/analytics-utils.js';
import {applyDidYouMeanCorrection} from '../../did-you-mean/did-you-mean-actions.js';
import {logDidYouMeanAutomatic} from '../../did-you-mean/did-you-mean-analytics-actions.js';
import {snapshot} from '../../history/history-actions.js';
import {extractHistory} from '../../history/history-state.js';
import {updateQuery} from '../../query/query-actions.js';
import {getQueryInitialState} from '../../query/query-state.js';
import {logTriggerQuery} from '../../triggers/trigger-analytics-actions.js';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from '../../triggers/triggers-actions.js';
import {logQueryError} from '../search-analytics-actions.js';
import {
  type ErrorResponse,
  type MappedSearchRequest,
  mapSearchResponse,
  type SuccessResponse,
} from '../search-mappings.js';
import {getSearchInitialState} from '../search-state.js';
import type {ExecuteSearchThunkReturn} from './search-actions.js';
import {buildSearchRequest} from './search-request.js';

export type StateNeededByExecuteSearch = ConfigurationSection &
  Partial<
    QuerySection &
      AdvancedSearchQueriesSection &
      PaginationSection &
      SortSection &
      FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      ContextSection &
      DidYouMeanSection &
      FieldsSection &
      PipelineSection &
      SearchHubSection &
      QuerySetSection &
      FacetOptionsSection &
      FacetOrderSection &
      DebugSection &
      SearchSection &
      FoldingSection &
      TriggerSection
  >;

interface FetchedResponse {
  response: SuccessResponse | ErrorResponse;
  duration: number;
  queryExecuted: string;
  requestExecuted: SearchRequest;
}

type ValidReturnTypeFromProcessingStep<RejectionType> =
  | ExecuteSearchThunkReturn
  | RejectionType;

export interface AsyncThunkConfig {
  getState: () => StateNeededByExecuteSearch;
  dispatch: ThunkDispatch<
    StateNeededByExecuteSearch,
    ClientThunkExtraArguments<SearchAPIClient> & {
      searchAPIClient?: SearchAPIClient | undefined;
    },
    AnyAction
  >;

  rejectWithValue: (err: SearchAPIErrorWithStatusCode) => unknown;
  analyticsAction: AnalyticsAsyncThunk | null;
  extra: ClientThunkExtraArguments<SearchAPIClient>;
}

type QueryCorrectionCallback = (modification: string) => void;

interface FetchFromAPIOptions {
  origin: SearchOrigin;
  disableAbortWarning?: boolean;
}

export class AsyncSearchThunkProcessor<RejectionType> {
  constructor(
    private config: AsyncThunkConfig,
    private onUpdateQueryForCorrection: QueryCorrectionCallback = (
      modification
    ) => {
      this.dispatch(updateQuery({q: modification}));
    }
  ) {}

  public async fetchFromAPI(
    {mappings, request}: MappedSearchRequest,
    options: FetchFromAPIOptions
  ) {
    const startedAt = Date.now();
    const response = mapSearchResponse(
      await this.extra.apiClient.search(request, options),
      mappings
    );
    const duration = Date.now() - startedAt;
    const queryExecuted = this.getState().query?.q || '';
    return {response, duration, queryExecuted, requestExecuted: request};
  }

  public async process(
    fetched: FetchedResponse
  ): Promise<ValidReturnTypeFromProcessingStep<RejectionType>> {
    return (
      this.processQueryErrorOrContinue(fetched) ??
      (await this.processQueryCorrectionsOrContinue(fetched)) ??
      (await this.processQueryTriggersOrContinue(fetched)) ??
      this.processSuccessResponse(fetched)
    );
  }

  private processQueryErrorOrContinue(
    fetched: FetchedResponse
  ): ValidReturnTypeFromProcessingStep<RejectionType> | null {
    if (isErrorResponse(fetched.response)) {
      this.dispatch(logQueryError(fetched.response.error));
      return this.rejectWithValue(fetched.response.error) as RejectionType;
    }

    return null;
  }

  private async processQueryCorrectionsOrContinue(
    fetched: FetchedResponse
  ): Promise<ValidReturnTypeFromProcessingStep<RejectionType> | null> {
    const state = this.getState();
    const successResponse = this.getSuccessResponse(fetched);

    if (!successResponse || !state.didYouMean) {
      return null;
    }

    const {enableDidYouMean, automaticallyCorrectQuery} = state.didYouMean;
    const {results, queryCorrections, queryCorrection} = successResponse;

    if (!enableDidYouMean || !automaticallyCorrectQuery) {
      return null;
    }

    const shouldExecuteClassicDidYouMeanAutoCorrection =
      results.length === 0 && queryCorrections && queryCorrections.length !== 0;

    const shouldExecuteModernDidYouMeanAutoCorrection =
      !isNullOrUndefined(queryCorrection) &&
      !isNullOrUndefined(queryCorrection.correctedQuery);

    const shouldExitWithNoAutoCorrection =
      !shouldExecuteClassicDidYouMeanAutoCorrection &&
      !shouldExecuteModernDidYouMeanAutoCorrection;

    if (shouldExitWithNoAutoCorrection) {
      return null;
    }

    const ret = shouldExecuteClassicDidYouMeanAutoCorrection
      ? await this.processLegacyDidYouMeanAutoCorrection(fetched)
      : this.processModernDidYouMeanAutoCorrection(fetched);

    this.dispatch(snapshot(extractHistory(this.getState())));

    return ret;
  }

  private async processLegacyDidYouMeanAutoCorrection(
    originalFetchedResponse: FetchedResponse
  ): Promise<ExecuteSearchThunkReturn | RejectionType | null> {
    const originalQuery = this.getCurrentQuery();
    const originalSearchSuccessResponse = this.getSuccessResponse(
      originalFetchedResponse
    )!;
    if (!originalSearchSuccessResponse.queryCorrections) {
      return null;
    }

    const {correctedQuery} = originalSearchSuccessResponse.queryCorrections[0];

    const retried =
      await this.automaticallyRetryQueryWithCorrection(correctedQuery);

    if (isErrorResponse(retried.response)) {
      this.dispatch(logQueryError(retried.response.error));
      return this.rejectWithValue(retried.response.error) as RejectionType;
    }

    this.logOriginalAnalyticsQueryBeforeAutoCorrection(originalFetchedResponse);
    this.dispatch(snapshot(extractHistory(this.getState())));

    return {
      ...retried,
      response: {
        ...retried.response.success,
        queryCorrections: originalSearchSuccessResponse.queryCorrections,
      },
      automaticallyCorrected: true,
      originalQuery,
      analyticsAction: logDidYouMeanAutomatic(),
    };
  }

  private processModernDidYouMeanAutoCorrection(
    originalFetchedResponse: FetchedResponse
  ): ExecuteSearchThunkReturn {
    const successResponse = this.getSuccessResponse(originalFetchedResponse)!;
    const {correctedQuery, originalQuery} = successResponse.queryCorrection!;

    this.onUpdateQueryForCorrection(correctedQuery);

    return {
      ...originalFetchedResponse,
      response: {
        ...successResponse,
      },
      queryExecuted: correctedQuery,
      automaticallyCorrected: true,
      originalQuery,
      analyticsAction: logDidYouMeanAutomatic(),
    };
  }

  private logOriginalAnalyticsQueryBeforeAutoCorrection(
    originalFetchedResponse: FetchedResponse
  ) {
    const state = this.getState();
    const successResponse = this.getSuccessResponse(originalFetchedResponse)!;
    this.analyticsAction?.()(
      this.dispatch,
      () =>
        this.getStateAfterResponse(
          originalFetchedResponse.queryExecuted,
          originalFetchedResponse.duration,
          state,
          successResponse
        ),
      this.extra
    );
  }

  private async processQueryTriggersOrContinue(
    fetched: FetchedResponse
  ): Promise<ValidReturnTypeFromProcessingStep<RejectionType> | null> {
    const successResponse = this.getSuccessResponse(fetched);
    if (!successResponse) {
      return null;
    }
    const correctedQuery =
      (successResponse.triggers.find((trigger) => trigger.type === 'query')
        ?.content as string) || '';

    if (!correctedQuery) {
      return null;
    }

    const ignored = this.getState().triggers?.queryModification.queryToIgnore;

    if (ignored === correctedQuery) {
      this.dispatch(updateIgnoreQueryTrigger(''));
      return null;
    }

    if (this.analyticsAction) {
      await this.dispatch(this.analyticsAction);
    }

    const originalQuery = this.getCurrentQuery();
    const retried =
      await this.automaticallyRetryQueryWithTriggerModification(correctedQuery);

    if (isErrorResponse(retried.response)) {
      this.dispatch(logQueryError(retried.response.error));
      return this.rejectWithValue(retried.response.error) as RejectionType;
    }

    this.dispatch(snapshot(extractHistory(this.getState())));
    return {
      ...retried,
      response: {
        ...retried.response.success,
      },
      automaticallyCorrected: false,
      originalQuery,
      analyticsAction: logTriggerQuery(),
    };
  }

  private getStateAfterResponse(
    query: string,
    duration: number,
    previousState: StateNeededByExecuteSearch,
    response: SearchResponseSuccess
  ): StateNeededBySearchAnalyticsProvider {
    return {
      ...previousState,
      query: {
        q: query,
        enableQuerySyntax:
          previousState.query?.enableQuerySyntax ??
          getQueryInitialState().enableQuerySyntax,
      },
      search: {
        ...getSearchInitialState(),
        duration,
        response,
        results: response.results,
      },
    };
  }

  private processSuccessResponse(
    fetched: FetchedResponse
  ): ValidReturnTypeFromProcessingStep<RejectionType> {
    this.dispatch(snapshot(extractHistory(this.getState())));
    return {
      ...fetched,
      response: this.getSuccessResponse(fetched)!,
      automaticallyCorrected: false,
      originalQuery: this.getCurrentQuery(),
      analyticsAction: this.analyticsAction!,
    };
  }

  private getSuccessResponse(fetched: FetchedResponse) {
    if (isSuccessResponse(fetched.response)) {
      return fetched.response.success;
    }
    return null;
  }

  private async automaticallyRetryQueryWithCorrection(correction: string) {
    this.onUpdateQueryForCorrection(correction);
    const fetched = await this.fetchFromAPI(
      await buildSearchRequest(this.getState()),
      {origin: 'mainSearch'}
    );
    this.dispatch(applyDidYouMeanCorrection(correction));
    return fetched;
  }

  private async automaticallyRetryQueryWithTriggerModification(
    modified: string
  ) {
    this.dispatch(
      applyQueryTriggerModification({
        newQuery: modified,
        originalQuery: this.getCurrentQuery(),
      })
    );
    this.onUpdateQueryForCorrection(modified);
    const fetched = await this.fetchFromAPI(
      await buildSearchRequest(this.getState()),
      {origin: 'mainSearch'}
    );

    return fetched;
  }

  private getCurrentQuery() {
    const state = this.getState();
    return state.query?.q !== undefined ? state.query.q : '';
  }

  private get extra() {
    return this.config.extra;
  }

  private getState() {
    return this.config.getState();
  }

  private get dispatch() {
    return this.config.dispatch;
  }

  private get analyticsAction() {
    return this.config.analyticsAction;
  }

  private get rejectWithValue() {
    return this.config.rejectWithValue;
  }
}
