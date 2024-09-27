import {ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {
  SearchOptions,
  isErrorResponse,
  isSuccessResponse,
} from '../../api/search/search-api-client.js';
import {
  InsightAPIClient,
  InsightAPIErrorStatusResponse,
} from '../../api/service/insight/insight-api-client.js';
import {InsightQueryRequest} from '../../api/service/insight/query/query-request.js';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions.js';
import {emptyLegacyCorrection} from '../did-you-mean/did-you-mean-state.js';
import {snapshot} from '../history/history-actions.js';
import {extractHistory} from '../history/history-state.js';
import {updateQuery} from '../query/query-actions.js';
import {ExecuteSearchThunkReturn} from '../search/search-actions.js';
import {
  ErrorResponse,
  MappedSearchRequest,
  SuccessResponse,
  mapSearchResponse,
} from '../search/search-mappings.js';
import {StateNeededByExecuteSearch} from './insight-search-actions.js';
import {logQueryError} from './insight-search-analytics-actions.js';
import {buildInsightSearchRequest} from './insight-search-request.js';

export interface AsyncThunkConfig {
  getState: () => StateNeededByExecuteSearch;
  dispatch: ThunkDispatch<
    StateNeededByExecuteSearch,
    ClientThunkExtraArguments<InsightAPIClient>,
    AnyAction
  >;
  rejectWithValue: (err: InsightAPIErrorStatusResponse) => unknown;
  extra: ClientThunkExtraArguments<InsightAPIClient>;
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
  ) {
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
    fetched: FetchedResponse
  ): Promise<ValidReturnTypeFromProcessingStep<RejectionType>> {
    return (
      this.processQueryErrorOrContinue(fetched) ??
      (await this.processQueryCorrectionsOrContinue(fetched)) ??
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

    this.dispatch(snapshot(extractHistory(this.getState())));

    return {
      ...retried,
      response: {
        ...retried.response.success,
        queryCorrections: fetched.response.success.queryCorrections,
      },
      automaticallyCorrected: true,
      originalQuery,
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
    };
  }

  private getSuccessResponse(fetched: FetchedResponse) {
    if (isSuccessResponse(fetched.response)) {
      return fetched.response.success;
    }
    return null;
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
}
