/**
 * Facets Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import * as facetMutations from './facets-mutators.js';
import * as selectors from './facets-selectors.js';
import {
  createTestEngine,
  createMockFacetValues,
} from '@/src/test/test-utils.js';
import type {FacetState} from './facets-types.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {facetsSlice} from '@/src/core/internal/facets/facets-slice.js';

describe('facetMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(facetsSlice); // Ensure slice is loaded for mutations
  });

  describe('setFacet()', () => {
    it('should return StateMutation object', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      };

      const mutation = facetMutations.setFacet(facet);

      expect(mutation).toEqual({
        type: 'facets/setFacet',
        payload: facet,
      });
    });

    it('should update state when used with mutate()', () => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      engine.mutate(facetMutations.setFacet(facet));

      const result = engine.read(selectors.byId('category'));
      expect(result).toEqual(facet);
    });

    it('should add multiple facets', () => {
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

      engine.mutate(facetMutations.setFacet(facet1));
      engine.mutate(facetMutations.setFacet(facet2));

      const all = engine.read(selectors.all);
      expect(Object.keys(all)).toHaveLength(2);
    });
  });

  describe('toggleValue()', () => {
    beforeEach(() => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(5),
        selectedValues: [],
      };
      engine.mutate(facetMutations.setFacet(facet));
    });

    it('should return StateMutation object', () => {
      const mutation = facetMutations.toggleValue('category', 'value-1');

      expect(mutation).toEqual({
        type: 'facets/toggleFacetValue',
        payload: {facetId: 'category', valueId: 'value-1'},
      });
    });

    it('should add value when not selected', () => {
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));

      const selected = engine.read(selectors.selectedValues('category'));
      expect(selected).toContain('value-1');
    });

    it('should remove value when already selected', () => {
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));

      const selected = engine.read(selectors.selectedValues('category'));
      expect(selected).not.toContain('value-1');
    });

    it('should handle multiple toggles', () => {
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));
      engine.mutate(facetMutations.toggleValue('category', 'value-2'));
      engine.mutate(facetMutations.toggleValue('category', 'value-3'));

      const selected = engine.read(selectors.selectedValues('category'));
      expect(selected).toHaveLength(3);
      expect(selected).toContain('value-1');
      expect(selected).toContain('value-2');
      expect(selected).toContain('value-3');
    });
  });

  describe('clearSelections()', () => {
    beforeEach(() => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(5),
        selectedValues: ['value-1', 'value-2', 'value-3'],
      };
      engine.mutate(facetMutations.setFacet(facet));
    });

    it('should return StateMutation object', () => {
      const mutation = facetMutations.clearSelections('category');

      expect(mutation).toEqual({
        type: 'facets/clearFacetSelections',
        payload: 'category',
      });
    });

    it('should clear all selections', () => {
      engine.mutate(facetMutations.clearSelections('category'));

      const selected = engine.read(selectors.selectedValues('category'));
      expect(selected).toEqual([]);
    });

    it('should not affect facet values', () => {
      const initial = engine.read(selectors.byId('category'));
      engine.mutate(facetMutations.clearSelections('category'));
      const after = engine.read(selectors.byId('category'));

      expect(after?.values).toEqual(initial?.values);
    });
  });

  describe('updateValues()', () => {
    beforeEach(() => {
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };
      engine.mutate(facetMutations.setFacet(facet));
    });

    it('should return StateMutation object', () => {
      const newValues = createMockFacetValues(5);
      const mutation = facetMutations.updateValues('category', newValues);

      expect(mutation).toEqual({
        type: 'facets/updateFacetValues',
        payload: {facetId: 'category', values: newValues},
      });
    });

    it('should update facet values', () => {
      const newValues = createMockFacetValues(5);
      engine.mutate(facetMutations.updateValues('category', newValues));

      const facet = engine.read(selectors.byId('category'));
      expect(facet?.values).toEqual(newValues);
      expect(facet?.values.length).toBe(5);
    });

    it('should not affect selected values', () => {
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));

      const newValues = createMockFacetValues(2);
      engine.mutate(facetMutations.updateValues('category', newValues));

      const selected = engine.read(selectors.selectedValues('category'));
      expect(selected).toContain('value-1');
    });
  });

  describe('Integration: facet management workflow', () => {
    it('should support complete facet lifecycle', () => {
      // Create facet
      const facet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(5),
        selectedValues: [],
      };
      engine.mutate(facetMutations.setFacet(facet));

      // Toggle some values
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));
      engine.mutate(facetMutations.toggleValue('category', 'value-3'));
      expect(engine.read(selectors.selectedValues('category'))).toHaveLength(2);

      // Update available values
      const newValues = createMockFacetValues(8);
      engine.mutate(facetMutations.updateValues('category', newValues));
      expect(engine.read(selectors.byId('category'))?.values.length).toBe(8);

      // Selections should persist
      expect(engine.read(selectors.selectedValues('category'))).toHaveLength(2);

      // Clear selections
      engine.mutate(facetMutations.clearSelections('category'));
      expect(engine.read(selectors.selectedValues('category'))).toEqual([]);
    });

    it('should handle multiple facets independently', () => {
      const categoryFacet: FacetState = {
        id: 'category',
        label: 'Category',
        values: createMockFacetValues(3),
        selectedValues: [],
      };

      const brandFacet: FacetState = {
        id: 'brand',
        label: 'Brand',
        values: createMockFacetValues(4),
        selectedValues: [],
      };

      engine.mutate(facetMutations.setFacet(categoryFacet));
      engine.mutate(facetMutations.setFacet(brandFacet));

      // Toggle in category
      engine.mutate(facetMutations.toggleValue('category', 'value-1'));

      // Toggle in brand
      engine.mutate(facetMutations.toggleValue('brand', 'value-2'));

      // Verify independence
      expect(engine.read(selectors.selectedValues('category'))).toEqual([
        'value-1',
      ]);
      expect(engine.read(selectors.selectedValues('brand'))).toEqual([
        'value-2',
      ]);

      // Clear category doesn't affect brand
      engine.mutate(facetMutations.clearSelections('category'));
      expect(engine.read(selectors.selectedValues('category'))).toEqual([]);
      expect(engine.read(selectors.selectedValues('brand'))).toEqual([
        'value-2',
      ]);
    });
  });
});
