import {describe, it, expect, afterEach} from 'vitest';
import {act, screen, cleanup, waitFor, fireEvent} from '@testing-library/react';
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

  it("shows the trigger's query and searches the shopper's query from the link", async () => {
    const {lastAction} = mountSummary({
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
    fireEvent.click(screen.getByRole('button', {name: 'swim gear'}));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'overrideCorrection', context: {}})
    );
  });

  it.each([false, true])(
    'names both queries of a correction, with a link only if canOverride is %s',
    async (canOverride) => {
      mountSummary({
        query: 'Water Sports',
        firstIndex: 1,
        lastIndex: 12,
        totalEntries: 43,
        correction: {originalQuery: 'water sprots', cause: 'correction', canOverride},
      });
      await waitFor(() =>
        expect(screen.getByText(/We couldn't find anything for/).textContent).toBe(
          "We couldn't find anything for water sprots"
        )
      );
      expect(screen.getByText(/Query was automatically corrected to/).textContent).toBe(
        'Query was automatically corrected to Water Sports'
      );
      expect(screen.queryByRole('button', {name: 'water sprots'}) !== null).toBe(canOverride);
    }
  );

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
});

describe('QuerySummary focus', () => {
  const CORRECTION = {originalQuery: 'swim gear', cause: 'trigger', canOverride: true};

  /** Holds the override in flight until `answer`: the surface stays locked meanwhile. */
  function answerable() {
    let answer: () => void = () => undefined;
    return {
      gate: () =>
        new Promise<void>((resolve) => {
          answer = resolve;
        }),
      answer: () =>
        act(async () => {
          answer();
          await Promise.resolve();
        }),
    };
  }

  function mountWithResults(dispatchGate: () => Promise<void>) {
    return mountSurface({
      component: {component: 'LayoutStack', direction: 'column', children: ['summary', 'list']},
      children: [
        {
          id: 'summary',
          component: 'QuerySummary',
          ...Object.fromEntries(
            Object.keys(BINDINGS).map((key) => [key, {path: `/state/summary/${key}`}])
          ),
        },
        {id: 'list', component: 'ProductList', products: {path: '/state/list/products'}},
      ],
      dataModel: [
        {path: '/state/summary/query', value: 'Water Sports'},
        {path: '/state/summary/firstIndex', value: 1},
        {path: '/state/summary/lastIndex', value: 1},
        {path: '/state/summary/totalEntries', value: 1},
        {path: '/state/summary/correction', value: CORRECTION},
        {
          path: '/state/list/products',
          value: [{permanentid: 'p1', ec_name: 'Trail Shoes', additionalFields: {}}],
        },
      ],
      dispatchGate,
    });
  }

  async function searchInsteadWithFocus() {
    const link = await screen.findByRole('button', {name: 'swim gear'});
    link.focus();
    fireEvent.click(link);
  }

  it('moves focus from the link to the results once the override is answered', async () => {
    const request = answerable();
    const {pushDataModel} = mountWithResults(request.gate);

    await searchInsteadWithFocus();
    pushDataModel([
      {path: '/state/summary/query', value: 'swim gear'},
      {path: '/state/summary/correction', value: undefined},
    ]);
    await request.answer();

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('list', {name: 'Product list'}))
    );
  });

  it('gives focus back to the link when the notice stays', async () => {
    const request = answerable();
    mountWithResults(request.gate);

    await searchInsteadWithFocus();
    await request.answer();

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', {name: 'swim gear'}))
    );
  });
});
