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
