import fc from 'fast-check';
import {
  createDispatchCoordinator,
  createDispatchTracker,
  createSettledDispatch,
  type DispatchSource,
} from '@coveo/thermidor';
import {describe, it, expect, vi} from 'vitest';
import {act, render} from '@testing-library/react';
import {DispatchProgressProvider} from './pending-dispatch.js';
import {type FacetSearchAction, useOptimisticFacetSearch} from './use-optimistic-facet-search.js';

type Seam = 'tracked' | 'withheld' | 'lost';

/**
 * Mounts the hook on the real tracker and coordinator, each `send` held open until `answer`. `sent`
 * is what reached the producer. `withheld`: settled on the spot (prompt streaming); `lost`: never
 * reaches the tracker (surface gone).
 */
function mount(initialBackend: string, seam: Seam = 'tracked') {
  const sent: string[] = [];
  const answers: Array<() => void> = [];
  const coordinator = createDispatchCoordinator<FacetSearchAction>((action) => {
    sent.push(action.event.name === 'search' ? action.event.context.query : '(clear)');
    return new Promise<void>((resolve) => answers.push(resolve));
  });
  const source: DispatchSource<FacetSearchAction> =
    seam === 'withheld'
      ? {issue: () => createSettledDispatch('withheld'), getSnapshot: coordinator.getSnapshot}
      : coordinator;
  const tracker = createDispatchTracker(source);

  const dispatch = vi.fn<(action: FacetSearchAction) => void>((action) => {
    if (seam !== 'lost') {
      void tracker.dispatch(action);
    }
  });

  let current!: ReturnType<typeof useOptimisticFacetSearch>;
  function Consumer({query}: {query: string}) {
    current = useOptimisticFacetSearch(query, dispatch);
    return null;
  }
  const tree = (query: string) => (
    <DispatchProgressProvider value={tracker}>
      <Consumer query={query} />
    </DispatchProgressProvider>
  );

  const view = render(tree(initialBackend));
  const push = (query: string) => act(() => view.rerender(tree(query)));

  return {
    dispatch,
    sent,
    unmount: () => view.unmount(),
    result: {
      get current() {
        return current;
      },
    },
    type: (next: string) => act(() => current.onQueryChange(next)),
    reset: () => act(() => current.reset()),
    /** An external change of `facetSearch.query`. */
    push,
    /** Answers the dispatch in flight: snapshot first, then settlement, as the session does. */
    answer: async (query: string) => {
      push(query);
      await act(async () => {
        answers.shift()?.();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    },
  };
}

describe('useOptimisticFacetSearch', () => {
  it('updates the local query and dispatches on every change', () => {
    const view = mount('');

    view.type('ri');
    view.type('rip');

    expect(view.result.current.query).toBe('rip');
    expect(view.dispatch).toHaveBeenCalledTimes(2);
    expect(view.dispatch).toHaveBeenNthCalledWith(1, {
      event: {name: 'search', context: {query: 'ri'}},
    });
    expect(view.dispatch).toHaveBeenNthCalledWith(2, {
      event: {name: 'search', context: {query: 'rip'}},
    });
  });

  it('keeps the typed query when the keystroke is lost before reaching the queue', () => {
    const view = mount('', 'lost');

    view.type('ripcurl');

    expect(view.sent).toEqual([]);
    expect(view.result.current.query).toBe('ripcurl');
  });

  it('keeps the typed query when the keystroke is withheld', () => {
    const view = mount('', 'withheld');

    view.type('ripcurl');

    expect(view.sent).toEqual([]);
    expect(view.result.current.query).toBe('ripcurl');
  });

  it('owes no echo for a withheld keystroke, so a later external change to that query still wins', () => {
    const view = mount('', 'withheld');

    view.type('ri');
    view.type('rip');

    // Neither keystroke went out, so this is not our echo.
    view.push('ri');
    expect(view.result.current.query).toBe('ri');
  });

  it('ignores the echo of a sent keystroke that is older than the current typing', async () => {
    const view = mount('');

    view.type('ri');
    view.type('ripcurl');
    expect(view.sent).toEqual(['ri']);

    await view.answer('ri');
    expect(view.result.current.query).toBe('ripcurl');
    expect(view.sent).toEqual(['ri', 'ripcurl']);

    await view.answer('ripcurl');
    expect(view.result.current.query).toBe('ripcurl');
  });

  it('adopts a genuine external change even while text is typed', () => {
    const view = mount('shoes');

    view.type('sh');
    expect(view.result.current.query).toBe('sh');

    view.push('sandals');
    expect(view.result.current.query).toBe('sandals');
  });

  it('does not mistake the echo of our own clear for an external clear (x -> "" -> y)', async () => {
    const view = mount('');

    view.type('x');
    await view.answer('x');
    expect(view.result.current.query).toBe('x');

    view.reset();
    expect(view.result.current.query).toBe('');
    view.type('y');
    expect(view.result.current.query).toBe('y');

    await view.answer('');
    expect(view.result.current.query).toBe('y');
    await view.answer('y');
    expect(view.result.current.query).toBe('y');
    expect(view.sent).toEqual(['x', '(clear)', 'y']);

    // Nothing owed anymore: this clear is external.
    view.push('');
    expect(view.result.current.query).toBe('');
  });

  it('clears the local value immediately on reset, even if the dispatch is lost', () => {
    const view = mount('rip', 'lost');

    view.reset();

    expect(view.result.current.query).toBe('');
    expect(view.dispatch).toHaveBeenCalledWith({event: {name: 'clearSearch', context: {}}});
  });

  it('coalesces a burst: 4 fast keystrokes send only the request in flight plus the latest', async () => {
    const view = mount('');

    view.type('r');
    view.type('ri');
    view.type('rip');
    view.type('ripc');

    expect(view.result.current.query).toBe('ripc');
    expect(view.sent).toEqual(['r']);

    await view.answer('r');
    expect(view.sent).toEqual(['r', 'ripc']);
    expect(view.result.current.query).toBe('ripc');
  });

  it('writes the same slot for search and clear, so a clear supersedes a queued keystroke', async () => {
    const view = mount('');

    view.type('r');
    view.type('ri');
    view.reset();

    await view.answer('r');
    expect(view.sent).toEqual(['r', '(clear)']);
    expect(view.result.current.query).toBe('');
  });
});

// Feature: a2ui-inline-state-data-model, Property 10: in-progress facet search input stays in
// LOCAL renderer state and is NEVER written to the shared A2-UI data model; for any sequence of
// typed input values, the hook (a) reflects the latest typed value locally and (b) reaches the
// producer only through the `dispatch` action seam (one dispatch per change, carrying the typed
// query) — it performs no data-model write of its own.
describe('optimistic facet input stays local; only a search action is dispatched (Property 10)', () => {
  it('never writes input to a shared model and dispatches exactly one search per change', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 20}),
        fc.array(fc.string({maxLength: 20}), {minLength: 1, maxLength: 8}),
        (backendQuery, typedValues) => {
          const view = mount(backendQuery);

          for (const value of typedValues) {
            view.type(value);
          }

          // (a) the local value reflects the latest typed value.
          expect(view.result.current.query).toBe(typedValues[typedValues.length - 1]);

          // (b) exactly one dispatch per change, each carrying the typed query verbatim.
          expect(
            view.dispatch.mock.calls.map(([action]) =>
              action.event.name === 'search' ? action.event.context.query : '(clear)'
            )
          ).toEqual(typedValues);

          view.unmount();
          return true;
        }
      ),
      {numRuns: 150}
    );
  });
});
