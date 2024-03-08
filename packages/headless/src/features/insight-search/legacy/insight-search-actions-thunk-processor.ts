import {ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {StateNeededByInsightAnalyticsProvider} from '../../../api/analytics/insight-analytics';
import {
  SearchOptions,
  isErrorResponse,
  isSuccessResponse,
} from '../../../api/search/search-api-client';
import {SearchResponseSuccess} from '../../../api/search/search/search-response';
import {
  InsightAPIClient,
  InsightAPIErrorStatusResponse,
} from '../../../api/service/insight/insight-api-client';
import {InsightQueryRequest} from '../../../api/service/insight/query/query-request';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {AnalyticsAsyncThunk} from '../../analytics/analytics-utils';
import {applyDidYouMeanCorrection} from '../../did-you-mean/did-you-mean-actions';
import {logDidYouMeanAutomatic} from '../../did-you-mean/did-you-mean-insight-analytics-actions';
import {emptyLegacyCorrection} from '../../did-you-mean/did-you-mean-state';
import {snapshot} from '../../history/history-actions';
import {extractHistory} from '../../history/history-state';
import {updateQuery} from '../../query/query-actions';
import {getQueryInitialState} from '../../query/query-state';
import {ExecuteSearchThunkReturn} from '../../search/legacy/search-actions';
import {
  ErrorResponse,
  MappedSearchRequest,
  SuccessResponse,
  mapSearchResponse,
} from '../../search/search-mappings';
import {getSearchInitialState} from '../../search/search-state';
import {StateNeededByExecuteSearch} from '../insight-search-actions';
import {logQueryError} from '../insight-search-analytics-actions';
import {buildInsightSearchRequest} from '../insight-search-request';

export interface AsyncThunkConfig {
  getState: () => StateNeededByExecuteSearch;
  dispatch: ThunkDispatch<
    StateNeededByExecuteSearch,
    ClientThunkExtraArguments<InsightAPIClient>,
    AnyAction
  >;
  rejectWithValue: (err: InsightAPIErrorStatusResponse) => unknown;
  extra: ClientThunkExtraArguments<InsightAPIClient>;
  analyticsAction: AnalyticsAsyncThunk | null;
}

interface FetchedResponse {
  response: SuccessResponse | ErrorResponse;
  duration: number;
  queryExecuted: string;
  requestExecuted: InsightQueryRequest;
}

type ValidReturnTypeFromProcessingStep<RejectionType> =
  | ExecuteSearchThunkReturn
  | RejectionType;

export class AsyncInsightSearchThunkProcessor<RejectionType> {
  constructor(private config: AsyncThunkConfig) {}

  public async fetchFromAPI(
    {request, mappings}: MappedSearchRequest<InsightQueryRequest>,
    options?: SearchOptions
  ): Promise<{
    response: SuccessResponse | ErrorResponse;
    duration: number;
    queryExecuted: string;
    requestExecuted: InsightQueryRequest;
  }> {
    const startedAt = new Date().getTime();
    const response = mapSearchResponse(
      await this.extra.apiClient.query(request, options),
      mappings
    );
    const duration = new Date().getTime() - startedAt;
    const queryExecuted = this.getState().query?.q || '';
    return {
      response,
      duration,
      queryExecuted,
      requestExecuted: request,
    };
  }

  public async process(
    fetched: FetchedResponse,
    mappedRequest: MappedSearchRequest<InsightQueryRequest>
  ): Promise<ValidReturnTypeFromProcessingStep<RejectionType>> {
    return (
      this.processQueryErrorOrContinue(fetched) ??
      (await this.processQueryCorrectionsOrContinue(fetched, mappedRequest)) ??
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
    fetched: FetchedResponse,
    mappedRequest: MappedSearchRequest<InsightQueryRequest>
  ): Promise<ValidReturnTypeFromProcessingStep<RejectionType> | null> {
    if (
      !this.shouldReExecuteTheQueryWithCorrections(fetched) ||
      isErrorResponse(fetched.response)
    ) {
      return null;
    }

    const {correctedQuery} = fetched.response.success.queryCorrections
      ? fetched.response.success.queryCorrections[0]
      : emptyLegacyCorrection();
    const originalQuery = this.getCurrentQuery();
    const retried =
      await this.automaticallyRetryQueryWithCorrection(correctedQuery);

    if (isErrorResponse(retried.response)) {
      this.dispatch(logQueryError(retried.response.error));
      return this.rejectWithValue(retried.response.error) as RejectionType;
    }

    this.logOriginalAnalyticsQueryBeforeAutoCorrection(fetched, mappedRequest);
    this.dispatch(snapshot(extractHistory(this.getState())));
    return {
      ...retried,
      response: {
        ...retried.response.success,
        queryCorrections: fetched.response.success.queryCorrections,
      },
      automaticallyCorrected: true,
      originalQuery,
      analyticsAction: logDidYouMeanAutomatic(),
    };
  }

  private shouldReExecuteTheQueryWithCorrections(
    fetched: FetchedResponse
  ): boolean {
    const state = this.getState();
    const successResponse = this.getSuccessResponse(fetched);

    if (
      state.didYouMean?.enableDidYouMean === true &&
      successResponse?.results.length === 0 &&
      successResponse?.queryCorrections &&
      successResponse?.queryCorrections.length !== 0
    ) {
      return true;
    }
    return false;
  }

  private async automaticallyRetryQueryWithCorrection(correction: string) {
    this.dispatch(updateQuery({q: correction}));
    const state = this.getState();
    const fetched = await this.fetchFromAPI(
      await buildInsightSearchRequest(state)
    );
    this.dispatch(applyDidYouMeanCorrection(correction));
    return fetched;
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

  private getStateAfterResponse(
    query: string,
    duration: number,
    previousState: StateNeededByExecuteSearch,
    response: SearchResponseSuccess
  ): StateNeededByInsightAnalyticsProvider {
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

  private logOriginalAnalyticsQueryBeforeAutoCorrection(
    originalFetchedResponse: FetchedResponse,
    mappedRequest: MappedSearchRequest<InsightQueryRequest>
  ) {
    const state = this.getState();
    const fetchedResponse = (
      mapSearchResponse(
        originalFetchedResponse.response,
        mappedRequest.mappings
      ) as SuccessResponse
    ).success;
    this.analyticsAction &&
      this.analyticsAction()(
        this.dispatch,
        () =>
          this.getStateAfterResponse(
            originalFetchedResponse.queryExecuted,
            originalFetchedResponse.duration,
            state,
            fetchedResponse
          ),
        this.extra
      );
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

  private get rejectWithValue() {
    return this.config.rejectWithValue;
  }

  private getCurrentQuery() {
    const state = this.getState();
    return state.query?.q !== undefined ? state.query.q : '';
  }

  private get analyticsAction() {
    return this.config.analyticsAction;
  }
}
