import {isNullOrUndefined} from '@coveo/bueno';
import type {UnknownAction} from '@reduxjs/toolkit';
import type {ThunkDispatch} from 'redux-thunk';
import {
  type CommerceAPIClient,
  type CommerceAPIResponse,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {FilterableCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import type {CommerceSearchRequest} from '../../../api/commerce/search/request.js';
import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import type {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import type {
  CommerceDidYouMeanSection,
  CommerceQuerySection,
  CommerceSearchSection,
  TriggerSection,
} from '../../../state/state-sections.js';
import {
  buildFilterableCommerceAPIRequest,
  type StateNeededForFilterableCommerceAPIRequest,
} from '../common/filterable-commerce-api-request-builder.js';
import {updateQuery} from '../query/query-actions.js';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from '../triggers/triggers-actions.js';
import type {QuerySearchCommerceAPIThunkReturn} from './search-actions.js';
import {queryExecutedFromResponseSelector} from './search-selectors.js';

interface FetchedResponse {
  response: CommerceAPIResponse<SearchCommerceSuccessResponse>;
  duration: number;
  queryExecuted: string;
  requestExecuted: FilterableCommerceAPIRequest;
}

export type StateNeededByExecuteSearch =
  StateNeededForFilterableCommerceAPIRequest &
    CommerceSearchSection &
    CommerceQuerySection &
    CommerceDidYouMeanSection &
    TriggerSection;

export interface AsyncThunkConfig {
  getState: () => StateNeededByExecuteSearch;
  dispatch: ThunkDispatch<
    StateNeededByExecuteSearch,
    ClientThunkExtraArguments<CommerceAPIClient> & {
      apiClient?: CommerceAPIClient | undefined;
    },
    UnknownAction
  >;

  rejectWithValue: (err: CommerceAPIErrorStatusResponse) => unknown;
  extra: ClientThunkExtraArguments<CommerceAPIClient>;
}

type ValidReturnTypeFromProcessingStep<RejectionType> =
  | QuerySearchCommerceAPIThunkReturn
  | RejectionType;

export class AsyncSearchThunkProcessor<RejectionType> {
  constructor(private config: AsyncThunkConfig) {}

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

  public async fetchFromAPI(
    request: FilterableCommerceAPIRequest | CommerceSearchRequest
  ) {
    const startedAt = Date.now();
    const response = await this.extra.apiClient.search(request);
    const duration = Date.now() - startedAt;
    const queryExecuted = this.getState().commerceQuery.query || '';
    return {response, duration, queryExecuted, requestExecuted: request};
  }

  private processSuccessResponse(
    fetched: FetchedResponse
  ): QuerySearchCommerceAPIThunkReturn {
    return {
      ...fetched,
      response: this.getSuccessResponse(fetched)!,
      originalQuery: this.getCurrentQuery(),
    };
  }

  private processQueryErrorOrContinue(
    fetched: FetchedResponse
  ): ValidReturnTypeFromProcessingStep<RejectionType> | null {
    if (isErrorResponse(fetched.response)) {
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
    const {queryCorrection} = successResponse;

    const shouldExecuteQueryCorrection =
      !isNullOrUndefined(queryCorrection) &&
      !isNullOrUndefined(queryCorrection.correctedQuery);

    if (!shouldExecuteQueryCorrection) {
      return null;
    }

    const {correctedQuery, originalQuery} = successResponse.queryCorrection!;

    this.onUpdateQueryForCorrection(correctedQuery ?? '');

    return {
      ...fetched,
      response: {
        ...successResponse,
      },
      queryExecuted: queryExecutedFromResponseSelector(state, successResponse),
      originalQuery: originalQuery ?? '',
    };
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
      this.dispatch(updateIgnoreQueryTrigger({q: ''}));
      return null;
    }

    const originalQuery = this.getCurrentQuery();
    const retried =
      await this.automaticallyRetryQueryWithTriggerModification(correctedQuery);

    if (isErrorResponse(retried.response)) {
      return this.rejectWithValue(retried.response.error) as RejectionType;
    }

    return {
      ...retried,
      response: {
        ...retried.response.success,
      },
      originalQuery,
    };
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
    const fetched = await this.fetchFromAPI({
      ...buildFilterableCommerceAPIRequest(
        this.getState(),
        this.navigatorContext
      ),
      query: modified,
    });

    return fetched;
  }

  private get dispatch() {
    return this.config.dispatch;
  }

  private get rejectWithValue() {
    return this.config.rejectWithValue;
  }

  private getState() {
    return this.config.getState();
  }

  private get navigatorContext() {
    return this.config.extra.navigatorContext;
  }

  private getCurrentQuery() {
    const state = this.getState();
    return state.commerceQuery.query !== undefined
      ? state.commerceQuery.query
      : '';
  }

  private getSuccessResponse(fetched: FetchedResponse) {
    if (isErrorResponse(fetched.response)) {
      return null;
    }
    return fetched.response.success;
  }

  private get extra() {
    return this.config.extra;
  }

  private onUpdateQueryForCorrection(modification: string) {
    this.dispatch(updateQuery({query: modification}));
  }
}
