import fc from 'fast-check';
import {describe, it, expect, vi} from 'vitest';
import {act, render} from '@testing-library/react';
import {type FacetSearchAction, useOptimisticFacetSearch} from './use-optimistic-facet-search.js';

/**
 * Mounts the hook against a backend query a test can move. The input is now pure LOCAL state, so no
 * dispatch coordinator is needed: the only producer-facing seam is the `dispatch` spy, and the only
 * thing that hands authority back is a change of the `query` prop.
 */
function mount(initialBackend: string, send?: (action: FacetSearchAction) => void) {
  let current!: ReturnType<typeof useOptimisticFacetSearch>;
  const dispatch = vi.fn<(action: FacetSearchAction) => void>(send ?? (() => {}));

  function Consumer({query}: {query: string}) {
    current = useOptimisticFacetSearch(query, dispatch);
    return null;
  }

  const view = render(<Consumer query={initialBackend} />);

  return {
    dispatch,
    unmount: () => view.unmount(),
    // A getter so destructuring does not freeze the first render.
    result: {
      get current() {
        return current;
      },
    },
    type: (next: string) => act(() => current.onQueryChange(next)),
    reset: () => act(() => current.reset()),
    /** The producer moves `facetSearch.query` — a new prop, with or without a reason of our own. */
    push: (query: string) => act(() => view.rerender(<Consumer query={query} />)),
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

  it('keeps the typed query when a snapshot answering an unrelated gesture leaves the query unchanged', () => {
    const view = mount('rip');

    view.type('ripcurl');
    expect(view.result.current.query).toBe('ripcurl');

    // A converse response to an unrelated gesture carries the facet node, but `facetSearch.query`
    // is the value the backend already knew ('rip' before our keystroke) — the prop does not move
    // from what it was, so nothing overrides the typing.
    view.push('rip');
    expect(view.result.current.query).toBe('ripcurl');
  });

  it('keeps the typed query when the keystroke is withheld, cancelled, or lost (no dispatch succeeds)', () => {
    // The seam issues no dispatch (withheld while a prompt streams, cancelled by preemption, or the
    // surface is gone). The producer never answers, so `facetSearch.query` does not move — the field
    // must stay exactly as typed, never snap back to the backend value.
    const view = mount('', () => {});

    view.type('ripcurl');

    expect(view.result.current.query).toBe('ripcurl');
    // No producer answer ever arrives: `facetSearch.query` stays at '' (unchanged from the initial
    // backend), so there is no real external change — the typed text survives untouched.
    view.push('');
    expect(view.result.current.query).toBe('ripcurl');
  });

  it('lets the backend query win when it changes for a reason other than our own dispatch', () => {
    // The backend already had an active search ('rip'); the user keeps typing.
    const view = mount('rip');

    view.type('ripcurl');
    expect(view.result.current.query).toBe('ripcurl');

    // A value selected from the search results clears the search on the producer side: a GENUINE
    // external change of `facetSearch.query` ('rip' -> ''). It wins and empties the local field.
    view.push('');
    expect(view.result.current.query).toBe('');
  });

  it('adopts a genuine external change even while text is typed', () => {
    const view = mount('shoes');

    view.type('sh');
    expect(view.result.current.query).toBe('sh');

    // Producer sets the query to something neither the user typed nor the previous backend value.
    view.push('sandals');
    expect(view.result.current.query).toBe('sandals');
  });

  it('does not clobber the local value with the echo of our own dispatch', () => {
    const view = mount('');

    view.type('rip');
    expect(view.dispatch).toHaveBeenCalledWith({
      event: {name: 'search', context: {query: 'rip'}},
    });

    // Backend echoes back the query we just dispatched. The prop moves to 'rip', which equals the
    // local value, so there is nothing to overwrite and no flicker.
    view.push('rip');
    expect(view.result.current.query).toBe('rip');
  });

  it('clears the local value immediately on reset, even if the dispatch is lost', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    // The seam issues no dispatch (surface gone), but clearing the field is LOCAL state — it must
    // happen at once regardless of whether the clear reaches the producer.
    const view = mount('rip', () => {});

    view.reset();

    expect(view.result.current.query).toBe('');
    expect(view.dispatch).toHaveBeenCalledWith({event: {name: 'clearSearch', context: {}}});
    reported.mockRestore();
  });

  it('reset clears the local value and dispatches the clear', () => {
    const view = mount('rip');

    view.reset();

    expect(view.result.current.query).toBe('');
    expect(view.dispatch).toHaveBeenCalledWith({event: {name: 'clearSearch', context: {}}});
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
