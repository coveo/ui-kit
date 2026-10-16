import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render} from '@testing-library/react';
import {type FacetSearchAction, useOptimisticFacetSearch} from './use-optimistic-facet-search.js';

function mount(initialBackend: string) {
  const dispatch = vi.fn<(action: FacetSearchAction) => void>();
  let current!: ReturnType<typeof useOptimisticFacetSearch>;
  function Consumer({query}: {query: string}) {
    current = useOptimisticFacetSearch(query, dispatch);
    return null;
  }
  const view = render(<Consumer query={initialBackend} />);
  return {
    dispatch,
    get current() {
      return current;
    },
    push: (query: string) => act(() => view.rerender(<Consumer query={query} />)),
  };
}

const sentQueries = (dispatch: ReturnType<typeof mount>['dispatch']) =>
  dispatch.mock.calls.map(([action]) =>
    action.event.name === 'search' ? action.event.context.query : '(clear)'
  );

describe('useOptimisticFacetSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows each keystroke at once but sends one search per pause', () => {
    const facet = mount('');

    act(() => facet.current.onQueryChange('b'));
    act(() => facet.current.onQueryChange('bi'));
    act(() => facet.current.onQueryChange('bil'));

    expect(facet.current.query).toBe('bil');
    expect(facet.dispatch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(200));

    expect(sentQueries(facet.dispatch)).toEqual(['bil']);
  });

  it('clears at once and drops the search still waiting', () => {
    const facet = mount('');

    act(() => facet.current.onQueryChange('bil'));
    act(() => facet.current.reset());
    act(() => vi.advanceTimersByTime(200));

    expect(facet.current.query).toBe('');
    expect(sentQueries(facet.dispatch)).toEqual(['(clear)']);
  });

  it('keeps the typed text when the producer echoes an older query', () => {
    const facet = mount('');

    act(() => facet.current.onQueryChange('bi'));
    act(() => vi.advanceTimersByTime(200));
    act(() => facet.current.onQueryChange('bil'));
    facet.push('bi');

    expect(facet.current.query).toBe('bil');
  });

  it('adopts a query the producer changed on its own', () => {
    const facet = mount('');

    act(() => facet.current.onQueryChange('bi'));
    facet.push('kayak');

    expect(facet.current.query).toBe('kayak');
  });
});
