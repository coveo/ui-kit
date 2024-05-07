import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response';
import {CommerceQuerySection} from '../../../state/state-sections';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';

export interface QuerySearchCommerceAPIThunkReturn {
  /** The successful response. */
  response: SearchCommerceSuccessResponse;
  /** The original query that was performed when an automatic correction is executed. */
  originalQuery: string;
}

export type StateNeededByExecuteSearch = StateNeededByQueryCommerceAPI &
  CommerceQuerySection;

export const executeSearch = createAsyncThunk<
  QuerySearchCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/executeSearch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.search({
      ...(await buildCommerceAPIRequest(state)),
      query: state.commerceQuery?.query,
    });

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      originalQuery:
        state.commerceQuery?.query !== undefined
          ? state.commerceQuery.query
          : '',
    };
  }
);
