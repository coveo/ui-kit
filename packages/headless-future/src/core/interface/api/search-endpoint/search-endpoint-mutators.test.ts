import {describe, expect, it} from 'vitest';
import * as searchEndpointMutators from './search-endpoint-mutators.js';

describe('search-endpoint mutators', () => {
  describe('setStatus', () => {
    it('returns a mutation with the given status', () => {
      const mutation = searchEndpointMutators.setStatus('pending');

      expect(mutation).toEqual({
        type: 'searchEndpoint/setStatus',
        payload: 'pending',
      });
    });
  });

  describe('setError', () => {
    it('returns a mutation with the given error', () => {
      const mutation = searchEndpointMutators.setError('something failed');

      expect(mutation).toEqual({
        type: 'searchEndpoint/setError',
        payload: 'something failed',
      });
    });

    it('returns a mutation with null to clear the error', () => {
      const mutation = searchEndpointMutators.setError(null);

      expect(mutation).toEqual({
        type: 'searchEndpoint/setError',
        payload: null,
      });
    });
  });

  describe('setConfiguration', () => {
    it('returns a mutation with the given configuration', () => {
      const config = {pipeline: 'default', searchHub: 'main'};
      const mutation = searchEndpointMutators.setConfiguration(config);

      expect(mutation).toEqual({
        type: 'searchEndpoint/setConfiguration',
        payload: config,
      });
    });
  });
});
