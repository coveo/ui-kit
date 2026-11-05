import {describe, it, expect, afterEach} from 'vitest';
import {screen, cleanup, waitFor, fireEvent} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * QuerySummary is a `createReactComponent` implementation driven by the generic binder, mounted
 * end-to-end through the real thermidor catalog: `query` / `firstIndex` / `lastIndex` /
 * `totalEntries` / `correction` are `{path}` bindings resolved from the surface data model. Its one
 * action, `overrideCorrection`, searches the shopper's query instead of the one that replaced it.
 *
 * Progressive-resolution cases (a field not yet arrived) are expressed by OMITTING that field's
 * data-model write, so the binding resolves `undefined` naturally.
 */

afterEach(() => cleanup());

const BINDINGS = {
  query: {path: '/state/root/query'},
  firstIndex: {path: '/state/root/firstIndex'},
  lastIndex: {path: '/state/root/lastIndex'},
  totalEntries: {path: '/state/root/totalEntries'},
  correction: {path: '/state/root/correction'},
};

// Only writes the provided fields; an omitted field's binding resolves undefined (progressive).
function mountSummary(state: Partial<Record<keyof typeof BINDINGS, unknown>>) {
  return mountSurface({
    component: {component: 'QuerySummary', ...BINDINGS},
    dataModel: (Object.keys(state) as Array<keyof typeof BINDINGS>).map((key) => ({
      path: `/state/root/${key}`,
      value: state[key],
    })),
  });
}

describe('QuerySummary', () => {
  it('renders nothing when there are no results and no query', async () => {
    const {container} = mountSummary({query: '', firstIndex: 0, lastIndex: 0, totalEntries: 0});
    // Wait a tick for the pump to process, then assert nothing rendered.
    await waitFor(() => expect(container.querySelector('p')).toBeNull());
    expect(screen.queryByText(/Products|No results/)).toBeNull();
  });

  it('renders a no-results message when there are no results but a query is present', async () => {
    mountSummary({query: 'Kayaks', firstIndex: 0, lastIndex: 0, totalEntries: 0});
    await waitFor(() => expect(screen.getByText(/No results for/)).toBeDefined());
    expect(screen.getByText('Kayaks')).toBeDefined();
  });

  it('renders the result window with the query when results exist', async () => {
    mountSummary({query: 'Water Sports', firstIndex: 1, lastIndex: 12, totalEntries: 43});
    await waitFor(() => expect(screen.getByText(/Products/)).toBeDefined());
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('43')).toBeDefined();
    expect(screen.getByText('Water Sports')).toBeDefined();
    expect(screen.getByText(/for/)).toBeDefined();
  });

  it('formats a large totalEntries with locale separators', async () => {
    mountSummary({query: 'Gear', firstIndex: 1, lastIndex: 12, totalEntries: 1234});
    await waitFor(() => expect(screen.getByText('1,234')).toBeDefined());
  });

  it('drops the trailing "for {query}" tail when the query is empty', async () => {
    mountSummary({query: '', firstIndex: 1, lastIndex: 12, totalEntries: 43});
    await waitFor(() => expect(screen.getByText(/Products/)).toBeDefined());
    expect(screen.queryByText(/for/)).toBeNull();
  });

  it('renders nothing while bindings resolve progressively (indices not yet defined)', async () => {
    // `totalEntries` has arrived but `firstIndex`/`lastIndex` have not: must not
    // render "Products undefined-undefined of 43".
    const {container} = mountSummary({query: 'Water Sports', totalEntries: 43});
    // Let the pump process; nothing should render — no <p> summary appears.
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders nothing while totalEntries is still unresolved', async () => {
    const {container} = mountSummary({query: 'Water Sports', firstIndex: 1, lastIndex: 12});
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('p')).toBeNull();
  });

  it('shows no correction when the query was searched as typed', async () => {
    mountSummary({query: 'Water Sports', firstIndex: 1, lastIndex: 12, totalEntries: 43});
    await waitFor(() => expect(screen.getByText(/Products/)).toBeDefined());
    expect(screen.queryByText(/Showing products for|automatically corrected/)).toBeNull();
  });

  it("shows the trigger's query and links to the shopper's query", async () => {
    mountSummary({
      query: 'Water Sports',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 43,
      correction: {originalQuery: 'swim gear', cause: 'trigger', canOverride: true},
    });
    await waitFor(() =>
      expect(screen.getByText(/Showing products for/).textContent).toBe(
        'Showing products for Water Sports'
      )
    );
    expect(screen.getByText(/Search instead for/).textContent).toBe('Search instead for swim gear');
    expect(screen.getByRole('button', {name: 'swim gear'})).toBeDefined();
  });

  it("names both queries of a correction without a link when the backend cannot search the shopper's query", async () => {
    mountSummary({
      query: 'Water Sports',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 43,
      correction: {originalQuery: 'water sprots', cause: 'correction', canOverride: false},
    });
    await waitFor(() =>
      expect(screen.getByText(/We couldn't find anything for/).textContent).toBe(
        "We couldn't find anything for water sprots"
      )
    );
    expect(screen.getByText(/Query was automatically corrected to/).textContent).toBe(
      'Query was automatically corrected to Water Sports'
    );
    expect(screen.queryByText(/Search instead for/)).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it("links to the shopper's query of a correction when the backend can search it", async () => {
    mountSummary({
      query: 'Water Sports',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 43,
      correction: {originalQuery: 'water sprots', cause: 'correction', canOverride: true},
    });
    await waitFor(() => expect(screen.getByRole('button', {name: 'water sprots'})).toBeDefined());
    expect(screen.getByText(/Query was automatically corrected to/)).toBeDefined();
  });

  it('shows the notice after the no-results line when the replacement has no results', async () => {
    mountSummary({
      query: 'kayak',
      firstIndex: 0,
      lastIndex: 0,
      totalEntries: 0,
      correction: {originalQuery: 'take a kayak', cause: 'trigger', canOverride: true},
    });
    await waitFor(() =>
      expect(screen.getByText(/No results for/).textContent).toBe('No results for kayak')
    );
    expect(screen.getByText(/Showing products for/)).toBeDefined();
    expect(screen.getByRole('button', {name: 'take a kayak'})).toBeDefined();
  });

  it('shows no correction while the query is empty', async () => {
    mountSummary({
      query: '',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 43,
      correction: {originalQuery: 'swim gear', cause: 'trigger', canOverride: true},
    });
    await waitFor(() => expect(screen.getByText(/Products/)).toBeDefined());
    expect(screen.queryByText(/Showing products for/)).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('dispatches overrideCorrection with an empty context', async () => {
    const {lastAction} = mountSummary({
      query: 'Water Sports',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 43,
      correction: {originalQuery: 'swim gear', cause: 'trigger', canOverride: true},
    });
    await waitFor(() => expect(screen.getByRole('button', {name: 'swim gear'})).toBeDefined());
    fireEvent.click(screen.getByRole('button', {name: 'swim gear'}));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'overrideCorrection',
        context: {},
      })
    );
  });
});
