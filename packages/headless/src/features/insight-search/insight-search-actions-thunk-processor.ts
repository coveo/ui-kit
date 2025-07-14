import {isNullOrUndefined} from '@coveo/bueno';
import type {AnyAction, ThunkDispatch} from '@reduxjs/toolkit';
import {
  isErrorResponse,
  isSuccessResponse,
  type SearchOptions,
} from '../../api/search/search-api-client.js';
import type {
  InsightAPIClient,
  InsightAPIErrorStatusResponse,
} from '../../api/service/insight/insight-api-client.js';
import type {InsightQueryRequest} from '../../api/service/insight/query/query-request.js';
import type {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions.js';
import {snapshot} from '../history/history-actions.js';
import {extractHistory} from '../history/history-state.js';
import {updateQuery} from '../query/query-actions.js';
import type {ExecuteSearchThunkReturn} from '../search/search-actions.js';
import {
  type ErrorResponse,
  type MappedSearchRequest,
  mapSearchResponse,
  type SuccessResponse,
} from '../search/search-mappings.js';
import type {StateNeededByExecuteSearch} from './insight-search-actions.js';
import {logQueryError} from './insight-search-analytics-actions.js';
import {buildInsightSearchRequest} from './insight-search-request.js';

interface FetchedResponse {
  response: SuccessResponse | ErrorResponse;
  duration: number;
  queryExecuted: string;
  requestExecuted: InsightQueryRequest;
}

type ValidReturnTypeFromProcessingStep<RejectionType> =
  | ExecuteSearchThunkReturn
  | RejectionType;

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

type QueryCorrectionCallback = (modification: string) => void;

export class AsyncInsightSearchThunkProcessor<RejectionType> {
  constructor(
    private config: AsyncThunkConfig,
    private onUpdateQueryForCorrection: QueryCorrectionCallback = (
      modification
    ) => {
      this.dispatch(updateQuery({q: modification}));
    }
  ) {}

  public async fetchFromAPI(
    {request, mappings}: MappedSearchRequest<InsightQueryRequest>,
    options?: SearchOptions
  ) {
    const startedAt = Date.now();
    const response = mapSearchResponse(
      await this.extra.apiClient.query(request, options),
      mappings
    );
    const duration = Date.now() - startedAt;
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

    const shouldExecuteLegacyDidYouMeanAutoCorrection =
      results.length === 0 && queryCorrections && queryCorrections.length !== 0;

    const shouldExecuteNextDidYouMeanAutoCorrection =
      !isNullOrUndefined(queryCorrection) &&
      !isNullOrUndefined(queryCorrection.correctedQuery);

    const shouldExitWithNoAutoCorrection =
      !shouldExecuteLegacyDidYouMeanAutoCorrection &&
      !shouldExecuteNextDidYouMeanAutoCorrection;

    if (shouldExitWithNoAutoCorrection) {
      return null;
    }
    const processedDidYouMean = shouldExecuteLegacyDidYouMeanAutoCorrection
      ? await this.processLegacyDidYouMeanAutoCorrection(fetched)
      : this.processNextDidYouMeanAutoCorrection(fetched);

    this.dispatch(snapshot(extractHistory(this.getState())));

    return processedDidYouMean;
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

    this.dispatch(snapshot(extractHistory(this.getState())));

    return {
      ...retried,
      response: {
        ...retried.response.success,
        queryCorrections: originalSearchSuccessResponse.queryCorrections,
      },
      automaticallyCorrected: true,
      originalQuery,
    };
  }

  private processNextDidYouMeanAutoCorrection(
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
    };
  }

  private async automaticallyRetryQueryWithCorrection(correction: string) {
    this.onUpdateQueryForCorrection(correction);
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
