import {describe, it, expect} from 'vitest';
import {
  searchEndpointSlice,
  initialSearchEndpointState,
} from './search-endpoint-slice.js';
import * as SearchEndpointActions from './search-endpoint-actions.js';

describe('searchEndpointSlice', () => {
  it('has correct initial state', () => {
    expect(initialSearchEndpointState).toEqual({
      configuration: {},
      status: 'idle',
      error: null,
    });
  });

  it('setStatus updates status', () => {
    const state = searchEndpointSlice.reducer(
      initialSearchEndpointState,
      SearchEndpointActions.setStatus('pending')
    );
    expect(state.status).toBe('pending');
  });

  it('setError updates error', () => {
    const state = searchEndpointSlice.reducer(
      initialSearchEndpointState,
      SearchEndpointActions.setError('something failed')
    );
    expect(state.error).toBe('something failed');
  });

  it('setError clears error with null', () => {
    const state = searchEndpointSlice.reducer(
      {...initialSearchEndpointState, error: 'old'},
      SearchEndpointActions.setError(null)
    );
    expect(state.error).toBeNull();
  });

  it('setConfiguration updates configuration', () => {
    const config = {orgId: 'test', token: 'abc'};
    const state = searchEndpointSlice.reducer(
      initialSearchEndpointState,
      SearchEndpointActions.setConfiguration(config)
    );
    expect(state.configuration).toEqual(config);
  });
});
