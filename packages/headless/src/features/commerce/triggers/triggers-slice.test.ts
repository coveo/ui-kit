import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildFetchProductListingResponse} from '../../../test/mock-product-listing.js';
import {buildMockExecuteTrigger} from '../../../test/mock-trigger-execute.js';
import {buildMockNotifyTrigger} from '../../../test/mock-trigger-notify.js';
import {buildMockQueryTrigger} from '../../../test/mock-trigger-query.js';
import {buildMockRedirectTrigger} from '../../../test/mock-trigger-redirect.js';
import {
  handleApplyQueryTriggerModification,
  handleFetchItemsFulfilled,
  handleFetchItemsPending,
  handleUpdateIgnoreQueryTrigger,
} from '../../triggers/triggers-slice-functions.js';
import {
  getTriggerInitialState,
  type TriggerState,
} from '../../triggers/triggers-state.js';
import {fetchProductListing} from '../product-listing/product-listing-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions.js';
import {commerceTriggersReducer} from './triggers-slice.js';

describe('commerce triggers slice', () => {
  let initialState: TriggerState;
  let initialStateCopy: TriggerState;
  let expectedState: TriggerState;
  let finalState: TriggerState;

  beforeEach(() => {
    vi.resetAllMocks();
    initialState = getTriggerInitialState();
    initialStateCopy = JSON.parse(
      JSON.stringify(initialState)
    ) as typeof initialState;
  });
  it('should have initial state', () => {
    expect(commerceTriggersReducer(undefined, {type: 'randomAction'})).toEqual(
      initialState
    );
  });

  it('on #executeSearch.pending, updates state using #handleFetchItemsPending', () => {
    expectedState = handleFetchItemsPending(initialStateCopy);
    const action = executeSearch.pending('');
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #executeSearch.fulfilled, updates state using #handleFetchItemsFulfilled', () => {
    const searchResponse = buildSearchResponse();
    searchResponse.response.triggers = [
      buildMockQueryTrigger(),
      buildMockNotifyTrigger(),
      buildMockExecuteTrigger(),
      buildMockRedirectTrigger(),
    ];
    const action = executeSearch.fulfilled(searchResponse, '');
    expectedState = handleFetchItemsFulfilled(
      initialStateCopy,
      action.payload.response.triggers
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #fetchProductListing.pending, updates state using #handleFetchItemsPending', () => {
    expectedState = handleFetchItemsPending(initialStateCopy);
    const action = fetchProductListing.pending('');
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #fetchProductListing.fulfilled, updates state using #handleFetchItemsFulfilled', () => {
    const fetchProductListingResponse = buildFetchProductListingResponse();
    fetchProductListingResponse.response.triggers = [
      buildMockQueryTrigger(),
      buildMockNotifyTrigger(),
      buildMockExecuteTrigger(),
      buildMockRedirectTrigger(),
    ];
    const action = fetchProductListing.fulfilled(
      fetchProductListingResponse,
      ''
    );
    expectedState = handleFetchItemsFulfilled(
      initialStateCopy,
      action.payload.response.triggers
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #applyQueryTriggerModification, updates state using #handleApplyQueryTriggerModification', () => {
    const action = applyQueryTriggerModification({
      newQuery: 'new query',
      originalQuery: 'original query',
    });
    expectedState = handleApplyQueryTriggerModification(
      initialStateCopy,
      action.payload
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });

  it('on #updateIgnoreQueryTrigger, updates state using #handleUpdateIgnoreQueryTrigger', () => {
    const action = updateIgnoreQueryTrigger({q: 'query to ignore'});
    expectedState = handleUpdateIgnoreQueryTrigger(
      initialStateCopy,
      action.payload.q
    );
    finalState = commerceTriggersReducer(initialState, action);

    expect(finalState).toEqual(expectedState);
  });
});
