import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {CommerceQuerySection} from '../../../state/state-sections';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {logProductListingV2Load} from '../product-listing/product-listing-analytics';

export type StateNeededByExecuteSearch = StateNeededByQueryCommerceAPI &
  CommerceQuerySection;

export const executeSearch = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
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
      // eslint-disable-next-line @cspell/spellchecker
      // TODO CAPI-244: Use actual search analytics action
      analyticsAction: logProductListingV2Load(),
    };
  }
);
