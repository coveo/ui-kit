import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {updateFromResponse} from './facets-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateFacetsSlice} from '@/src/core/internal/facets/facets-slice.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('facetMutations', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreateFacetsSlice(iface));
  });

  describe('updateFromResponse()', () => {
    it('should return StateMutation object', () => {
      const facets = [{facetId: 'cat', field: 'cat', values: []}];
      const mutation = updateFromResponse(facets, iface);
      expect(mutation.type).toBe('default/facets/updateFromResponse');
      expect(mutation.payload).toEqual(facets);
    });

    it('should update facet values when used with mutate()', () => {
      const facets = [
        {
          facetId: 'category',
          field: 'category',
          values: [{value: 'shoes', state: 'idle', numberOfResults: 10}],
        },
      ];
      engine.mutate(updateFromResponse(facets as any, iface));
    });

    it('should handle undefined payload', () => {
      engine.mutate(updateFromResponse(undefined, iface));
    });
  });
});
