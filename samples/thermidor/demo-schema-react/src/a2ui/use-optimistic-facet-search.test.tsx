import fc from 'fast-check';
import {createStaleScopes} from '@coveo/thermidor';
import {describe, it, expect, vi} from 'vitest';
import {act, render} from '@testing-library/react';
import {
  type CoalesceIntent,
  type DispatchId,
  type DispatchOutcome,
  type DispatchProgress,
  DispatchProgressProvider,
  type IssuedDispatch,
} from './pending-dispatch.js';
import {type FacetSearchAction, useOptimisticFacetSearch} from './use-optimistic-facet-search.js';

/**
 * Stands in for the coordinator the app mounts: issuing a dispatch mints an identity, and an
 * answer retires the oldest outstanding one.
 */
function createCoordinator() {
  let minted = 0;
  let pending: ReadonlySet<DispatchId> = new Set();
  const settlers = new Map<DispatchId, Array<(outcome: DispatchOutcome) => void>>();
  let lastIssued: IssuedDispatch | undefined;
  const declared: CoalesceIntent[] = [];

  return {
    declared,
    progress: (): DispatchProgress => ({
      inFlight: () => [...pending][0],
      lastIssued: () => lastIssued,
      declareGesture: (declaration) => {
        if (declaration.coalesce !== undefined) {
          declared.push(declaration.coalesce);
        }
        return () => {};
      },
      stale: createStaleScopes(),
    }),
    issue: () => {
      minted += 1;
      const id: DispatchId = `dispatch-${minted}`;
      settlers.set(id, []);
      pending = new Set(pending).add(id);
      lastIssued = {
        id,
        // Resolved by `answer` alongside the listeners: the resolver rides in the same list.
        settled: new Promise<DispatchOutcome>((resolve) => {
          settlers.get(id)?.push(resolve);
        }),
        onSettled: (listener) => {
          const waiting = settlers.get(id);
          if (waiting === undefined) {
            listener('answered');
          } else {
            waiting.push(listener);
          }
        },
      };
    },
    answer: () => {
      const [oldest] = pending;
      if (oldest === undefined) {
        return;
      }
      const next = new Set(pending);
      next.delete(oldest);
      pending = next;
      for (const listener of settlers.get(oldest) ?? []) {
        listener('answered');
      }
      settlers.delete(oldest);
    },
  };
}

/** Mounts the hook under the provider the app supplies, against a coordinator a test advances. */
function mount(initialBackend: string, send?: (action: FacetSearchAction) => void) {
  const coordinator = createCoordinator();
  let current!: ReturnType<typeof useOptimisticFacetSearch>;
  let backend = initialBackend;

  const dispatchSearch = vi.fn<(action: FacetSearchAction) => void>(
    send ??
      (() => {
        coordinator.issue();
      })
  );

  function Consumer({query}: {query: string}) {
    current = useOptimisticFacetSearch(query, dispatchSearch);
    return null;
  }

  function Tree({query, progress}: {query: string; progress: DispatchProgress}) {
    return (
      <DispatchProgressProvider value={progress}>
        <Consumer query={query} />
      </DispatchProgressProvider>
    );
  }

  const view = render(<Tree query={backend} progress={coordinator.progress()} />);
  const flush = () => {
    act(() => view.rerender(<Tree query={backend} progress={coordinator.progress()} />));
  };

  return {
    coordinator,
    dispatchSearch,
    unmount: () => view.unmount(),
    // A getter on `current`: destructuring must not freeze the first render.
    result: {
      get current() {
        return current;
      },
    },
    type: (next: string) => act(() => current.onQueryChange(next)),
    /** A dispatch carrying nothing optimistic of its own — a facet click, pagination. */
    dispatch: () => {
      act(() => coordinator.issue());
      flush();
    },
    /** The next answer arrives, reporting `query`. */
    answer: (query: string) => {
      backend = query;
      act(() => coordinator.answer());
      flush();
    },
    /** A new snapshot with no answer attached. */
    push: (query: string) => {
      backend = query;
      flush();
    },
  };
}

describe('useOptimisticFacetSearch', () => {
  it('updates the local query and dispatches on every change', () => {
    const view = mount('');

    view.type('ri');
    view.type('rip');

    expect(view.result.current.query).toBe('rip');
    expect(view.dispatchSearch).toHaveBeenCalledTimes(2);
    expect(view.dispatchSearch).toHaveBeenNthCalledWith(1, {
      event: {name: 'search', context: {query: 'ri'}},
    });
    expect(view.dispatchSearch).toHaveBeenNthCalledWith(2, {
      event: {name: 'search', context: {query: 'rip'}},
    });
  });

  it('holds the typed query against a snapshot answering another gesture', () => {
    const view = mount('rip');
    expect(view.result.current.query).toBe('rip');

    view.type('ripcurl');
    expect(view.result.current.query).toBe('ripcurl');

    // Every converse response carries the facet's whole node, `facetSearch.query` included, so a
    // response to an unrelated gesture reports the query the backend knew at the time. Adopting
    // it would empty the field mid-typing.
    view.push('');
    expect(view.result.current.query).toBe('ripcurl');
  });

  it('hands authority back once the keystroke has been answered', () => {
    const view = mount('');

    view.type('ripcurl');
    view.answer('ripcurl');
    // The backend may now change the query on its own (a selection cleared the search).
    view.push('');

    expect(view.result.current.query).toBe('');
  });

  it('keeps the typed query while only an unrelated dispatch is answered', () => {
    const view = mount('');

    // A facet click goes out first, so its answer comes first too.
    view.dispatch();
    view.type('ripcurl');
    view.answer('');

    expect(view.result.current.query).toBe('ripcurl');
  });

  it('does not clobber the local value with the echo of our own dispatch', () => {
    const view = mount('');

    view.type('rip');
    expect(view.dispatchSearch).toHaveBeenCalledWith({
      event: {name: 'search', context: {query: 'rip'}},
    });

    // Backend echoes back the query we just dispatched: local value must be preserved.
    view.push('rip');
    expect(view.result.current.query).toBe('rip');
  });

  it('reset clears the local value and dispatches the clear', () => {
    const view = mount('rip');

    act(() => view.result.current.reset());

    expect(view.result.current.query).toBe('');
    expect(view.dispatchSearch).toHaveBeenCalledWith({event: {name: 'clearSearch', context: {}}});
  });

  it('clears nothing, and reports it, when the seam issues no dispatch', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = mount('rip', () => {});

    // The cleared field would never be answered, so it must not be shown as cleared at all.
    act(() => view.result.current.reset());

    expect(view.result.current.query).toBe('rip');
    expect(reported).toHaveBeenCalledWith(
      expect.stringContaining('An action was lost: clearSearch')
    );
    reported.mockRestore();
  });

  it('declares the query as an absolute write, so a keystroke replaces the queued one', () => {
    const view = mount('');

    view.type('ri');
    view.type('rip');

    expect(view.coordinator.declared.map((intent) => intent.policy)).toEqual([
      'absolute',
      'absolute',
    ]);
    // Both keystrokes write the same slot, which is what lets the newest replace the queued one.
    const [first, second] = view.coordinator.declared;
    expect(first?.slot).toBe(second?.slot);
  });

  it('declares the clear as the same absolute write as a keystroke', () => {
    const view = mount('rip');

    view.type('ripcurl');
    act(() => view.result.current.reset());

    const [typed, cleared] = view.coordinator.declared;
    expect(cleared?.policy).toBe('absolute');
    expect(cleared?.slot).toBe(typed?.slot);
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
          const view = mount(backendQuery);

          for (const value of typedValues) {
            view.type(value);
          }

          // (a) the local value reflects the latest typed value.
          expect(view.result.current.query).toBe(typedValues[typedValues.length - 1]);

          // (b) exactly one dispatch per change, each carrying the typed query verbatim.
          expect(
            view.dispatchSearch.mock.calls.map(([action]) =>
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
