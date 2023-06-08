import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {
  isErrorResponse,
  isSuccessResponse,
  SearchAPIClient,
} from '../../api/search/search-api-client';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {SearchOrigin} from '../../api/search/search-metadata';
import {SearchRequest} from '../../api/search/search/search-request';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
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
} from '../../state/state-sections';
import {AnalyticsAsyncThunk, AnalyticsType} from '../analytics/analytics-utils';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {logDidYouMeanAutomatic} from '../did-you-mean/did-you-mean-analytics-actions';
import {snapshot} from '../history/history-actions';
import {extractHistory} from '../history/history-state';
import {updateQuery} from '../query/query-actions';
import {getQueryInitialState} from '../query/query-state';
import {logTriggerQuery} from '../triggers/trigger-analytics-actions';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from '../triggers/triggers-actions';
import {ExecuteSearchThunkReturn} from './search-actions';
import {logQueryError} from './search-analytics-actions';
import {
  ErrorResponse,
  MappedSearchRequest,
  mapSearchResponse,
  SuccessResponse,
} from './search-mappings';
import {buildSearchRequest} from './search-request';
import {getSearchInitialState} from './search-state';

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
  analyticsAction: AnalyticsAsyncThunk<{
    analyticsType: AnalyticsType.Search;
  }> | null;
  extra: ClientThunkExtraArguments<SearchAPIClient>;
}

type QueryCorrectionCallback = (modification: string) => void;

export interface FetchFromAPIOptions {
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
    const startedAt = new Date().getTime();
    const response = mapSearchResponse(
      await this.extra.apiClient.search(request, options),
      mappings
    );
    const duration = new Date().getTime() - startedAt;
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
    if (!successResponse) {
      return null;
    }
    if (
      state.didYouMean?.enableDidYouMean === false ||
      successResponse.results.length !== 0 ||
      successResponse.queryCorrections.length === 0
    ) {
      return null;
    }

    const originalQuery = this.getCurrentQuery();
    const {correctedQuery} = successResponse.queryCorrections[0];
    const retried = await this.automaticallyRetryQueryWithCorrection(
      correctedQuery
    );

    if (isErrorResponse(retried.response)) {
      this.dispatch(logQueryError(retried.response.error));
      return this.rejectWithValue(retried.response.error) as RejectionType;
    }

    this.analyticsAction &&
      this.analyticsAction()(
        this.dispatch,
        () =>
          this.getStateAfterResponse(
            fetched.queryExecuted,
            fetched.duration,
            state,
            successResponse
          ),
        this.extra
      );
    this.dispatch(snapshot(extractHistory(this.getState())));

    return {
      ...retried,
      response: {
        ...retried.response.success,
        queryCorrections: successResponse.queryCorrections,
      },
      automaticallyCorrected: true,
      originalQuery,
      analyticsAction: logDidYouMeanAutomatic(),
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
      this.dispatch(updateIgnoreQueryTrigger(''));
      return null;
    }

    if (this.analyticsAction) {
      await this.dispatch(this.analyticsAction);
    }

    const originalQuery = this.getCurrentQuery();
    const retried = await this.automaticallyRetryQueryWithTriggerModification(
      correctedQuery
    );

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
