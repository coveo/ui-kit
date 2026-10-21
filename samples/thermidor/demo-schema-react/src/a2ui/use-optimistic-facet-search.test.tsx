import fc from 'fast-check';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render} from '@testing-library/react';
import {
  type FacetSearchAction,
  SEARCH_DEBOUNCE_MS,
  useOptimisticFacetSearch,
} from './use-optimistic-facet-search.js';
import {SessionRequestProvider, type SessionRequestSource} from './session-request.js';

function mount(initialBackend: string) {
  const dispatch = vi.fn<(action: FacetSearchAction) => void>();
  // A session sending another request, until the test frees it.
  const session: {busy: boolean} & SessionRequestSource = {
    busy: false,
    get request() {
      return this.busy ? ({kind: 'prompt', turnId: 'turn'} as const) : undefined;
    },
    subscribe: () => () => {},
    sendAndWait: () => Promise.resolve(),
  };

  let current!: ReturnType<typeof useOptimisticFacetSearch>;
  function Consumer({
    query,
    onDispatch = dispatch,
  }: {
    query: string;
    onDispatch?: (action: FacetSearchAction) => void;
  }) {
    current = useOptimisticFacetSearch(query, onDispatch);
    return null;
  }

  const view = render(<Consumer query={initialBackend} />, {
    wrapper: ({children}) => (
      <SessionRequestProvider value={session}>{children}</SessionRequestProvider>
    ),
  });

  return {
    dispatch,
    sent: () =>
      dispatch.mock.calls.map(([action]) =>
        action.event.name === 'search' ? action.event.context.query : '(clear)'
      ),
    unmount: () => view.unmount(),
    get query() {
      return current.query;
    },
    type: (next: string) => act(() => current.onQueryChange(next)),
    pause: () => act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)),
    reset: () => act(() => current.reset()),
    setBusy: (busy: boolean) => {
      session.busy = busy;
    },
    /** A change of `facetSearch.query` from the producer: an echo or an external change. */
    push: (query: string) => act(() => view.rerender(<Consumer query={query} />)),
    /** A re-render with another dispatch, as when a reply rebuilds the surface. */
    rerenderWith: (query: string, onDispatch: (action: FacetSearchAction) => void) =>
      act(() => view.rerender(<Consumer query={query} onDispatch={onDispatch} />)),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useOptimisticFacetSearch', () => {
  it('shows each keystroke at once and sends one search once typing pauses', () => {
    const view = mount('');

    view.type('n');
    view.type('ni');
    view.type('nik');
    expect(view.query).toBe('nik');
    expect(view.sent()).toEqual([]);

    view.pause();
    expect(view.sent()).toEqual(['nik']);
  });

  it('sends a search that fires after a re-render through the latest dispatch', () => {
    const view = mount('');
    view.type('bl');
    view.pause();
    view.type('blue');

    const rebuilt = vi.fn<(action: FacetSearchAction) => void>();
    view.rerenderWith('bl', rebuilt);
    view.pause();

    expect(view.sent()).toEqual(['bl']);
    expect(rebuilt).toHaveBeenCalledWith({event: {name: 'search', context: {query: 'blue'}}});
  });

  it('holds a search back while the session is busy, then sends the latest query', () => {
    const view = mount('');
    view.setBusy(true);

    view.type('ni');
    view.pause();
    view.type('nike');
    view.pause();
    view.pause();
    expect(view.sent()).toEqual([]);

    view.setBusy(false);
    view.pause();
    expect(view.sent()).toEqual(['nike']);
  });

  it('keeps the typed query when the search never reaches the producer', () => {
    const view = mount('');

    view.type('nike');
    view.pause();

    expect(view.query).toBe('nike');
  });

  it('ignores the echo of a search older than the current typing', () => {
    const view = mount('');
    view.type('ni');
    view.pause();
    view.type('nike');

    view.push('ni');

    expect(view.query).toBe('nike');
  });

  it('adopts an external change and drops the search waiting to be sent', () => {
    const view = mount('');
    view.type('nik');

    view.push('adidas');
    view.pause();

    expect(view.query).toBe('adidas');
    expect(view.sent()).toEqual([]);
  });

  it('does not mistake the echo of our own clear for an external clear (x -> "" -> y)', () => {
    const view = mount('x');
    view.reset();
    view.type('y');

    view.push('');

    expect(view.query).toBe('y');
  });

  it('clears at once on reset and sends clearSearch without waiting', () => {
    const view = mount('nike');
    view.type('nikes');

    view.reset();

    expect(view.query).toBe('');
    expect(view.sent()).toEqual(['(clear)']);
    view.pause();
    expect(view.sent()).toEqual(['(clear)']);
  });

  it('sends nothing after unmounting', () => {
    const view = mount('');
    view.type('nike');

    view.unmount();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(view.sent()).toEqual([]);
  });
});

describe('optimistic facet input stays local; only a search action is dispatched (Property 10)', () => {
  it('shows the latest typed value and sends it once typing pauses', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 20}),
        fc.array(fc.string({maxLength: 20}), {minLength: 1, maxLength: 8}),
        (backendQuery, typedValues) => {
          const view = mount(backendQuery);

          for (const value of typedValues) {
            view.type(value);
          }
          view.pause();

          const latest = typedValues[typedValues.length - 1];
          expect(view.query).toBe(latest);
          expect(view.sent()).toEqual([latest]);

          view.unmount();
          return true;
        }
      ),
      {numRuns: 150}
    );
  });
});
