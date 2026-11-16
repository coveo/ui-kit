import {describe, it, expect, afterEach, beforeEach, vi, type Mock} from 'vitest';
import {screen, fireEvent, cleanup, waitFor, act, within} from '@testing-library/react';
import type {PageSizeProps, PaginationProps, Product, SortProps} from '@coveo/thermidor-schema';
import {mountSurface} from './mount-surface.harness.js';

afterEach(cleanup);

function mountControl<TProps extends object>(
  component: string,
  state: TProps,
  dispatchGate?: () => Promise<void> | void
) {
  return mountSurface({
    component: {
      component,
      ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
    },
    dispatchGate,
    dataModel: (Object.keys(state) as Array<keyof TProps>).map((key) => ({
      path: `/state/root/${String(key)}`,
      value: state[key],
    })),
  });
}

function heldOpen() {
  let answer!: () => void;
  const pending = new Promise<void>((resolve) => (answer = resolve));
  return {
    gate: () => pending,
    answer: async () => {
      await act(async () => {
        answer();
        await Promise.resolve();
      });
    },
  };
}

describe('Pagination', () => {
  const state: PaginationProps = {page: 0, pageSize: 12, totalEntries: 60, totalPages: 5};

  it('optimistically marks the clicked page current before the backend reconciles', async () => {
    const held = heldOpen();
    const {lastAction} = mountControl('Pagination', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText('Page 3')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 3'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 2}})
    );
    expect(screen.getByLabelText('Page 3').getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('Page 1').getAttribute('aria-current')).toBeNull();

    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText('Page 3') as HTMLButtonElement).disabled).toBe(false)
    );
  });

  it('clamps a held page that a shrinking producer totalPages would put out of range', async () => {
    const held = heldOpen();
    const {lastAction, pushDataModel} = mountControl('Pagination', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText('Page 5')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 5'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 4}})
    );

    // A concurrent gesture (e.g. a larger page size) shrinks the producer while page 5 is held.
    pushDataModel([{path: '/state/root/totalPages', value: 2}]);

    await waitFor(() => expect(screen.queryByLabelText('Page 5')).toBeNull());
    expect(screen.getByLabelText('Page 2').getAttribute('aria-current')).toBe('page');
    held.answer();
  });
});

describe('PageSize', () => {
  const state: PageSizeProps = {pageSize: 12};

  it('optimistically shows the chosen size before the backend reconciles', async () => {
    const held = heldOpen();
    const {lastAction} = mountControl('PageSize', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '48'}});

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'setPageSize', context: {pageSize: 48}})
    );
    expect((screen.getByLabelText(/Products per page/) as HTMLSelectElement).value).toBe('48');

    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText(/Products per page/) as HTMLSelectElement).value).toBe('12')
    );
  });

  it('keeps the backend size selectable while another size is in flight', async () => {
    // 96 is not a default option: it only exists because the producer applies it.
    const held = heldOpen();
    mountControl<PageSizeProps>('PageSize', {pageSize: 96}, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '12'}});

    await waitFor(() => expect(select.value).toBe('12'));
    const optionValues = Array.from(select.options).map((option) => option.value);
    expect(optionValues).toContain('96');
    held.answer();
  });
});

describe('Page change focus', () => {
  let scrollIntoView: Mock;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  function products(page: number): Product[] {
    return [1, 2].map((n) => ({
      permanentid: `p${page}-${n}`,
      ec_name: `Page ${page} product ${n}`,
      ec_price: 10 * n,
      additionalFields: {},
    }));
  }

  /** Holds the request in flight until `answer` or `fail`: the surface stays locked meanwhile. */
  function held() {
    let settle!: {resolve: () => void; reject: (error: Error) => void};
    const pending = new Promise<void>((resolve, reject) => (settle = {resolve, reject}));
    const end = (finish: () => void) =>
      act(async () => {
        finish();
        await pending.catch(() => undefined);
      });
    return {
      gate: () => pending,
      answer: () => end(settle.resolve),
      fail: () => end(() => settle.reject(new Error('Page change failed'))),
    };
  }

  function mountResults(dispatchGate: () => Promise<void>) {
    return mountSurface({
      component: {
        component: 'LayoutStack',
        direction: 'column',
        children: ['size', 'list', 'pages'],
      },
      children: [
        {id: 'size', component: 'PageSize', pageSize: {path: '/state/pagination/pageSize'}},
        {id: 'list', component: 'ProductList', products: {path: '/state/list/products'}},
        {
          id: 'pages',
          component: 'Pagination',
          page: {path: '/state/pagination/page'},
          pageSize: {path: '/state/pagination/pageSize'},
          totalEntries: {path: '/state/pagination/totalEntries'},
          totalPages: {path: '/state/pagination/totalPages'},
        },
      ],
      dataModel: [
        {path: '/state/list/products', value: products(2)},
        {
          path: '/state/pagination',
          value: {page: 1, pageSize: 12, totalEntries: 60, totalPages: 5},
        },
      ],
      dispatchGate,
    });
  }

  const productList = () => screen.getByRole('list', {name: 'Product list'});
  const firstProduct = () => within(productList()).getAllByRole('listitem')[0];

  async function changePage(label: string) {
    await waitFor(() => expect(screen.getByLabelText(label)).toBeDefined());
    fireEvent.click(screen.getByLabelText(label));
  }

  it.each(['Previous page', 'Next page', 'Page 4'])(
    'scrolls to the results and focuses the first product once %s is answered',
    async (label) => {
      const request = held();
      const {pushDataModel, lastAction} = mountResults(request.gate);

      await changePage(label);
      await waitFor(() => expect(lastAction()?.name).toBe('selectPage'));
      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(document.body);

      pushDataModel([{path: '/state/list/products', value: products(3)}]);
      await request.answer();

      await waitFor(() => expect(document.activeElement).toBe(firstProduct()));
      expect(firstProduct().textContent).toContain('Page 3 product 1');
      expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({block: 'start'});
      expect(scrollIntoView.mock.contexts[0]).toBe(productList());
    }
  );

  it('scrolls to the results and focuses the first product once a page size is answered', async () => {
    const request = held();
    const {pushDataModel} = mountResults(request.gate);

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    fireEvent.change(screen.getByLabelText(/Products per page/), {target: {value: '48'}});
    pushDataModel([
      {path: '/state/list/products', value: products(1)},
      {path: '/state/pagination', value: {page: 0, pageSize: 48, totalEntries: 60, totalPages: 2}},
    ]);
    await request.answer();

    await waitFor(() => expect(document.activeElement).toBe(firstProduct()));
    expect(scrollIntoView.mock.contexts).toEqual([productList()]);
  });

  it("leaves an earlier turn's results alone", async () => {
    const earlierTurn = document.createElement('div');
    earlierTurn.setAttribute('data-product-list', '');
    earlierTurn.innerHTML = '<article role="listitem" tabindex="-1">Earlier product</article>';
    document.body.prepend(earlierTurn);
    const request = held();
    mountResults(request.gate);

    await changePage('Next page');
    await request.answer();

    await waitFor(() => expect(document.activeElement).toBe(firstProduct()));
    expect(scrollIntoView.mock.contexts).toEqual([productList()]);
    earlierTurn.remove();
  });

  it('leaves scroll and focus alone when the page change fails', async () => {
    const request = held();
    mountResults(request.gate);

    await changePage('Next page');
    await request.fail();

    await waitFor(() =>
      expect((screen.getByLabelText('Next page') as HTMLButtonElement).disabled).toBe(false)
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it('leaves the focus where the shopper moved it while the page change was answered', async () => {
    const elsewhere = document.createElement('a');
    elsewhere.href = '#elsewhere';
    document.body.append(elsewhere);
    const request = held();
    mountResults(request.gate);

    await changePage('Next page');
    elsewhere.focus();
    await request.answer();

    await waitFor(() =>
      expect((screen.getByLabelText('Next page') as HTMLButtonElement).disabled).toBe(false)
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(elsewhere);
    elsewhere.remove();
  });
});

describe('Sort', () => {
  const state: SortProps = {
    appliedSort: {sortCriteria: 'relevance', fields: []},
    availableSorts: [
      {sortCriteria: 'relevance', fields: []},
      {
        sortCriteria: 'fields',
        fields: [{field: 'ec_price', direction: 'asc', displayName: 'Price (Low to High)'}],
      },
    ],
  };

  it('optimistically shows the chosen criterion before the backend reconciles', async () => {
    const held = heldOpen();
    const {lastAction} = mountControl('Sort', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Sort by/)).toBeDefined());
    const select = screen.getByLabelText(/Sort by/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '1'}});

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectSort',
        context: {sortCriteria: 'fields', fields: [{field: 'ec_price', direction: 'asc'}]},
      })
    );
    expect((screen.getByLabelText(/Sort by/) as HTMLSelectElement).value).toBe('1');

    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText(/Sort by/) as HTMLSelectElement).value).toBe('0')
    );
  });
});
