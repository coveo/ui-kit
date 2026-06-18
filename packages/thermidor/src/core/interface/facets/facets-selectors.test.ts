/**
 * Facets Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
  createTestEngine,
  createMockFacetValues,
} from '@/src/test/test-utils.js';
import {
  all as selectAll,
  allSelectedValues,
  byId,
  selectedValues,
} from './facets-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateFacetsSlice} from '@/src/core/internal/facets/facets-slice.js';
import type {FacetState} from './facets-types.js';

describe('createFacetsSelectors()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreateFacetsSlice('default'));
  });

  describe('all selector', () => {
    it('should return empty object initially', () => {
      const all = engine.read(selectAll);
      expect(all).toEqual({});
    });
  });

  describe('byId selector', () => {
    it('should return undefined for non-existent facet', () => {
      const facet = engine.read(byId('category'));
      expect(facet).toBeUndefined();
    });
  });

  describe('selectedValues selector', () => {
    it('should return empty array for non-existent facet', () => {
      const selected = engine.read(selectedValues('category'));
      expect(selected).toEqual([]);
    });
  });

  describe('allSelectedValues selector', () => {
    it('should return empty array when no facets', () => {
      const all = engine.read(allSelectedValues);
      expect(all).toEqual([]);
    });
  });
});
