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
import {setFacet, toggleValue} from './facets-mutators.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {facetsSlice} from '@/src/core/internal/facets/facets-slice.js';
import {FacetState} from './facets-types.js';

describe('createFacetsSelectors()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(facetsSlice); // Ensure slice is loaded for selectors
  });

  describe('all selector', () => {
    it('should return empty object initially', () => {
      const all = engine.read(selectAll);
      expect(all).toEqual({});
    });

    it('should return all facets after additions', () => {
      const facet1: FacetState = {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      };
      const facet2: FacetState = {
        id: 'brand',
        label: 'Brand',
        values: [],
        selectedValues: [],
      };

      engine.mutate(setFacet(facet1));
      engine.mutate(setFacet(facet2));

      const all = engine.read(selectAll);
      expect(Object.keys(all)).toHaveLength(2);
      expect(all.category).toEqual(facet1);
      expect(all.brand).toEqual(facet2);
    });
  });

  describe('byId selector', () => {
    it('should return undefined for non-existent facet', () => {
      const facet = engine.read(byId('category'));
      expect(facet).toBeUndefined();
    });

    it('should return facet by ID', () => {
      const facetState: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      engine.mutate(setFacet(facetState));
      const facet = engine.read(byId('category'));

      expect(facet).toEqual(facetState);
    });

    it('should return correct facet among multiple facets', () => {
      const facet1: FacetState = {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      };
      const facet2: FacetState = {
        id: 'brand',
        label: 'Brand',
        values: [],
        selectedValues: [],
      };

      engine.mutate(setFacet(facet1));
      engine.mutate(setFacet(facet2));

      const category = engine.read(byId('category'));
      expect(category?.id).toBe('category');
    });
  });

  describe('selectedValues selector', () => {
    it('should return empty array for non-existent facet', () => {
      const selected = engine.read(selectedValues('category'));
      expect(selected).toEqual([]);
    });

    it('should return empty array when no selections', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      engine.mutate(setFacet(facet));
      const selected = engine.read(selectedValues('category'));

      expect(selected).toEqual([]);
    });

    it('should return selected value IDs', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(5),
        selectedValues: ['value-1', 'value-3'],
      };

      engine.mutate(setFacet(facet));
      const selected = engine.read(selectedValues('category'));

      expect(selected).toEqual(['value-1', 'value-3']);
    });

    it('should update when selections change', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      engine.mutate(setFacet(facet));
      engine.mutate(toggleValue('category', 'value-1'));

      const selected = engine.read(selectedValues('category'));
      expect(selected).toContain('value-1');
    });
  });

  describe('allSelectedValues selector', () => {
    it('should return empty array when no facets', () => {
      const all = engine.read(allSelectedValues);
      expect(all).toEqual([]);
    });

    it('should return empty array when facets exist but none selected', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      engine.mutate(setFacet(facet));
      const all = engine.read(allSelectedValues);

      expect(all).toEqual([]);
    });

    it('should return all selected values from single facet', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(5),
        selectedValues: ['value-1', 'value-3'],
      };

      engine.mutate(setFacet(facet));
      const all = engine.read(allSelectedValues);

      expect(all).toEqual([
        {facetId: 'category', valueId: 'value-1'},
        {facetId: 'category', valueId: 'value-3'},
      ]);
    });

    it('should return all selected values from multiple facets', () => {
      const categoryFacet: FacetState = {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: ['electronics', 'books'],
      };

      const brandFacet: FacetState = {
        id: 'brand',
        label: 'Brand',
        values: [],
        selectedValues: ['apple', 'samsung'],
      };

      engine.mutate(setFacet(categoryFacet));
      engine.mutate(setFacet(brandFacet));

      const all = engine.read(allSelectedValues);

      expect(all).toHaveLength(4);
      expect(all).toContainEqual({facetId: 'category', valueId: 'electronics'});
      expect(all).toContainEqual({facetId: 'category', valueId: 'books'});
      expect(all).toContainEqual({facetId: 'brand', valueId: 'apple'});
      expect(all).toContainEqual({facetId: 'brand', valueId: 'samsung'});
    });

    it('should update when selections change', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      engine.mutate(setFacet(facet));

      let all = engine.read(allSelectedValues);
      expect(all).toEqual([]);

      engine.mutate(toggleValue('category', 'value-1'));
      all = engine.read(allSelectedValues);

      expect(all).toEqual([{facetId: 'category', valueId: 'value-1'}]);
    });
  });
});
