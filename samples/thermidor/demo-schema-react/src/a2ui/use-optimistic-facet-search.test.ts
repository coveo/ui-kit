import fc from 'fast-check';
import {describe, it, expect, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useOptimisticFacetSearch} from './use-optimistic-facet-search.js';

describe('useOptimisticFacetSearch', () => {
  it('updates the local query and dispatches on every change', () => {
    const dispatch = vi.fn();
    const {result} = renderHook(() => useOptimisticFacetSearch('', dispatch));

    act(() => result.current.onQueryChange('ri'));
    act(() => result.current.onQueryChange('rip'));

    expect(result.current.query).toBe('rip');
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, 'ri');
    expect(dispatch).toHaveBeenNthCalledWith(2, 'rip');
  });

  it('lets the backend query win when it changes for a reason other than our own dispatch', () => {
    const dispatch = vi.fn();
    const {result, rerender} = renderHook(
      ({backend}) => useOptimisticFacetSearch(backend, dispatch),
      {initialProps: {backend: 'rip'}}
    );
    expect(result.current.query).toBe('rip');

    act(() => result.current.onQueryChange('ripcurl'));
    expect(result.current.query).toBe('ripcurl');

    // Backend changes the query for another reason (e.g. a selection cleared the search).
    rerender({backend: ''});
    expect(result.current.query).toBe('');
  });

  it('does not clobber the local value with the echo of our own dispatch', () => {
    const dispatch = vi.fn();
    const {result, rerender} = renderHook(
      ({backend}) => useOptimisticFacetSearch(backend, dispatch),
      {initialProps: {backend: ''}}
    );

    act(() => result.current.onQueryChange('rip'));
    expect(dispatch).toHaveBeenCalledWith('rip');

    // Backend echoes back the query we just dispatched: local value must be preserved.
    rerender({backend: 'rip'});
    expect(result.current.query).toBe('rip');
  });

  it('reset clears the local value', () => {
    const dispatch = vi.fn();
    const {result} = renderHook(() => useOptimisticFacetSearch('rip', dispatch));

    act(() => result.current.reset());
    expect(result.current.query).toBe('');
  });
});

// Feature: a2ui-inline-state-data-model, Property 10: in-progress facet search input stays in
// LOCAL renderer state and is NEVER written to the shared A2-UI data model; for any sequence of
// typed input values, the hook (a) reflects the latest typed value locally and (b) reaches the
// producer only through the `dispatchSearch` action seam (one dispatch per change, carrying the
// typed query) — it performs no data-model write of its own.
describe('optimistic facet input stays local; only a search action is dispatched (Property 10)', () => {
  it('never writes input to a shared model and dispatches exactly one search per change', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 20}),
        fc.array(fc.string({maxLength: 20}), {minLength: 1, maxLength: 8}),
        (backendQuery, typedValues) => {
          // `dispatchSearch` is the ONLY producer-facing seam; the hook is given no data-model
          // writer, so the sole observable effect must be these action dispatches.
          const dispatched: string[] = [];
          const dispatchSearch = (query: string) => {
            dispatched.push(query);
          };

          const {result} = renderHook(() => useOptimisticFacetSearch(backendQuery, dispatchSearch));

          for (const value of typedValues) {
            act(() => result.current.onQueryChange(value));
          }

          // (a) the local value reflects the latest typed value.
          expect(result.current.query).toBe(typedValues[typedValues.length - 1]);

          // (b) exactly one dispatch per change, each carrying the typed query verbatim.
          expect(dispatched).toEqual(typedValues);

          return true;
        }
      ),
      {numRuns: 150}
    );
  });
});
