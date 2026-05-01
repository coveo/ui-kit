/**
 * Facets Slice Tests
 */

import {describe, it, expect} from 'vitest';
import {facetsSlice, initialFacetsState} from './facets-slice.js';
import type {
  FacetState,
  FacetValue,
} from '@/src/core/interface/facets/facets-types.js';

describe('facetsSlice: initialState', () => {
  it('should have empty object as initial state', () => {
    expect(initialFacetsState).toEqual({});
  });
});

describe('facetsSlice: setFacet', () => {
  it('should add a new facet', () => {
    const facet: FacetState = {
      id: 'category',
      label: 'Category',
      values: [],
      selectedValues: [],
    };

    const state = facetsSlice.reducer(
      initialFacetsState,
      facetsSlice.actions.setFacet(facet)
    );

    expect(state.category).toEqual(facet);
  });

  it('should update an existing facet', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
    };

    const updatedFacet: FacetState = {
      id: 'category',
      label: 'Updated Category',
      values: [{id: 'val1', label: 'Value 1', count: 10}],
      selectedValues: [],
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.setFacet(updatedFacet)
    );

    expect(state.category).toEqual(updatedFacet);
  });

  it('should not affect other facets', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
      brand: {
        id: 'brand',
        label: 'Brand',
        values: [],
        selectedValues: [],
      },
    };

    const newFacet: FacetState = {
      id: 'price',
      label: 'Price',
      values: [],
      selectedValues: [],
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.setFacet(newFacet)
    );

    expect(state.category).toEqual(initialState.category);
    expect(state.brand).toEqual(initialState.brand);
    expect(state.price).toEqual(newFacet);
  });
});

describe('facetsSlice: toggleFacetValue', () => {
  const facetWithValues: Record<string, FacetState> = {
    category: {
      id: 'category',
      label: 'Category',
      values: [
        {id: 'electronics', label: 'Electronics', count: 50},
        {id: 'books', label: 'Books', count: 30},
      ],
      selectedValues: [],
    },
  };

  it('should add value to selectedValues when not selected', () => {
    const state = facetsSlice.reducer(
      facetWithValues,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'electronics',
      })
    );

    expect(state.category.selectedValues).toContain('electronics');
    expect(state.category.selectedValues.length).toBe(1);
  });

  it('should remove value from selectedValues when already selected', () => {
    const initialState = {
      ...facetWithValues,
      category: {
        ...facetWithValues.category,
        selectedValues: ['electronics'],
      },
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'electronics',
      })
    );

    expect(state.category.selectedValues).not.toContain('electronics');
    expect(state.category.selectedValues.length).toBe(0);
  });

  it('should toggle multiple values independently', () => {
    let state = facetWithValues;

    // Add electronics
    state = facetsSlice.reducer(
      state,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'electronics',
      })
    );
    expect(state.category.selectedValues).toEqual(['electronics']);

    // Add books
    state = facetsSlice.reducer(
      state,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'books',
      })
    );
    expect(state.category.selectedValues).toEqual(['electronics', 'books']);

    // Remove electronics
    state = facetsSlice.reducer(
      state,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'electronics',
      })
    );
    expect(state.category.selectedValues).toEqual(['books']);
  });

  it('should handle non-existent facet gracefully', () => {
    const state = facetsSlice.reducer(
      initialFacetsState,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'nonexistent',
        valueId: 'value',
      })
    );

    expect(state).toEqual(initialFacetsState);
  });

  it('should not affect other facets', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
      brand: {
        id: 'brand',
        label: 'Brand',
        values: [],
        selectedValues: ['nike'],
      },
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'electronics',
      })
    );

    expect(state.brand.selectedValues).toEqual(['nike']);
  });
});

describe('facetsSlice: clearFacetSelections', () => {
  it('should clear all selected values for a facet', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: ['electronics', 'books', 'clothing'],
      },
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.clearFacetSelections('category')
    );

    expect(state.category.selectedValues).toEqual([]);
  });

  it('should not affect other facet properties', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [{id: 'val1', label: 'Value 1', count: 10}],
        selectedValues: ['val1'],
      },
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.clearFacetSelections('category')
    );

    expect(state.category.id).toBe('category');
    expect(state.category.label).toBe('Category');
    expect(state.category.values).toEqual(initialState.category.values);
  });

  it('should handle non-existent facet gracefully', () => {
    const state = facetsSlice.reducer(
      initialFacetsState,
      facetsSlice.actions.clearFacetSelections('nonexistent')
    );

    expect(state).toEqual(initialFacetsState);
  });

  it('should not affect other facets', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: ['electronics'],
      },
      brand: {
        id: 'brand',
        label: 'Brand',
        values: [],
        selectedValues: ['nike', 'adidas'],
      },
    };

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.clearFacetSelections('category')
    );

    expect(state.category.selectedValues).toEqual([]);
    expect(state.brand.selectedValues).toEqual(['nike', 'adidas']);
  });
});

describe('facetsSlice: updateFacetValues', () => {
  it('should update facet values', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
    };

    const newValues: FacetValue[] = [
      {id: 'electronics', label: 'Electronics', count: 50},
      {id: 'books', label: 'Books', count: 30},
    ];

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.updateFacetValues({
        facetId: 'category',
        values: newValues,
      })
    );

    expect(state.category.values).toEqual(newValues);
  });

  it('should replace previous values completely', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [
          {id: 'old1', label: 'Old 1', count: 10},
          {id: 'old2', label: 'Old 2', count: 20},
        ],
        selectedValues: [],
      },
    };

    const newValues: FacetValue[] = [{id: 'new1', label: 'New 1', count: 15}];

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.updateFacetValues({
        facetId: 'category',
        values: newValues,
      })
    );

    expect(state.category.values).toEqual(newValues);
    expect(state.category.values.length).toBe(1);
  });

  it('should not affect selectedValues', () => {
    const initialState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: ['electronics', 'books'],
      },
    };

    const newValues: FacetValue[] = [
      {id: 'electronics', label: 'Electronics', count: 50},
    ];

    const state = facetsSlice.reducer(
      initialState,
      facetsSlice.actions.updateFacetValues({
        facetId: 'category',
        values: newValues,
      })
    );

    expect(state.category.selectedValues).toEqual(['electronics', 'books']);
  });

  it('should handle non-existent facet gracefully', () => {
    const state = facetsSlice.reducer(
      initialFacetsState,
      facetsSlice.actions.updateFacetValues({
        facetId: 'nonexistent',
        values: [],
      })
    );

    expect(state).toEqual(initialFacetsState);
  });
});

describe('facetsSlice: state immutability', () => {
  it('should not mutate original state for any action', () => {
    const original: Record<string, FacetState> = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
    };

    facetsSlice.reducer(
      original,
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'val1',
      })
    );
    expect(original.category.selectedValues).toEqual([]);

    facetsSlice.reducer(
      original,
      facetsSlice.actions.clearFacetSelections('category')
    );
    expect(original.category.selectedValues).toEqual([]);
  });
});
