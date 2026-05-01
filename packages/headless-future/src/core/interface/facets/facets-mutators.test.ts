import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as facetMutations from './facets-mutators.js';
import {createMockFacetValues} from '@/src/test/test-utils.js';
import type {FacetState} from './facets-types.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {facetsSlice} from '@/src/core/internal/facets/facets-slice.js';

describe('facetMutations', () => {
  let engine: Engine;
  let mutateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateSpy = vi.fn();
    engine = {
      mutate: mutateSpy,
    } as unknown as Engine;
  });

  it('setFacet() should call engine.mutate with setFacet action', () => {
    const facet: FacetState = {
      id: 'category',
      label: 'Category',
      values: createMockFacetValues(3),
      selectedValues: [],
    };

    facetMutations.setFacet(engine, facet);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      facetsSlice.actions.setFacet(facet)
    );
  });

  it('toggleValue() should call engine.mutate with toggleFacetValue action', () => {
    facetMutations.toggleValue(engine, 'category', 'value-1');

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      facetsSlice.actions.toggleFacetValue({
        facetId: 'category',
        valueId: 'value-1',
      })
    );
  });

  it('clearSelections() should call engine.mutate with clearFacetSelections action', () => {
    facetMutations.clearSelections(engine, 'category');

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      facetsSlice.actions.clearFacetSelections('category')
    );
  });

  it('updateValues() should call engine.mutate with updateFacetValues action', () => {
    const values = createMockFacetValues(5);

    facetMutations.updateValues(engine, 'category', values);

    expect(mutateSpy).toHaveBeenCalledExactlyOnceWith(
      facetsSlice.actions.updateFacetValues({
        facetId: 'category',
        values,
      })
    );
  });
});
