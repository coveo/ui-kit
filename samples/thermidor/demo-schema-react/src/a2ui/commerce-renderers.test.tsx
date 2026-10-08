import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from './mount-surface.harness.js';

/**
 * Pagination / Sort / ProductList are `createReactComponent` implementations driven by the generic
 * binder, mounted end-to-end through the real thermidor catalog: props are `{path}` bindings
 * resolved from the surface data model, and user gestures dispatch actions that surface on
 * `onAction` (flattened `{name, context, ...}`). See `./mount-surface.harness.tsx`.
 */

afterEach(() => cleanup());

describe('Pagination', () => {
  const bindings = {
    page: {path: '/state/root/page'},
    pageSize: {path: '/state/root/pageSize'},
    totalEntries: {path: '/state/root/totalEntries'},
    totalPages: {path: '/state/root/totalPages'},
  };

  function mountPagination(state: {
    page: number;
    pageSize: number;
    totalEntries: number;
    totalPages: number;
  }) {
    return mountSurface({
      component: {component: 'Pagination', ...bindings},
      dataModel: [
        {path: '/state/root/page', value: state.page},
        {path: '/state/root/pageSize', value: state.pageSize},
        {path: '/state/root/totalEntries', value: state.totalEntries},
        {path: '/state/root/totalPages', value: state.totalPages},
      ],
    });
  }

  it('renders page buttons from resolved props', async () => {
    mountPagination({page: 1, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Pagination')).toBeDefined());
    expect(screen.getByLabelText('Page 1')).toBeDefined();
    expect(screen.getByLabelText('Page 2')).toBeDefined();
    expect(screen.getByLabelText('Page 3')).toBeDefined();
  });

  it('marks the current page as active', async () => {
    mountPagination({page: 1, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Page 2')).toBeDefined());
    expect(screen.getByLabelText('Page 2').getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('Page 1').getAttribute('aria-current')).toBeNull();
  });

  it('dispatches a selectPage action when a page button is clicked', async () => {
    const {lastAction} = mountPagination({page: 0, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Page 3')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 3'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 2}})
    );
  });

  it('dispatches selectPage with next page on next button click', async () => {
    const {lastAction} = mountPagination({page: 0, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Next page')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Next page'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 1}})
    );
  });

  it('dispatches selectPage with previous page on previous button click', async () => {
    const {lastAction} = mountPagination({page: 2, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Previous page')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Previous page'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 1}})
    );
  });

  it('disables previous button on first page', async () => {
    mountPagination({page: 0, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Previous page')).toBeDefined());
    expect((screen.getByLabelText('Previous page') as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables next button on last page', async () => {
    mountPagination({page: 2, pageSize: 10, totalEntries: 30, totalPages: 3});

    await waitFor(() => expect(screen.getByLabelText('Next page')).toBeDefined());
    expect((screen.getByLabelText('Next page') as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders only five page buttons around the current page when there are many pages', async () => {
    mountPagination({page: 20, pageSize: 20, totalEntries: 820, totalPages: 41});

    await waitFor(() => expect(screen.getByLabelText('Page 21')).toBeDefined());
    expect(screen.getAllByRole('button', {name: /^Page \d+$/}).map((b) => b.textContent)).toEqual([
      '19',
      '20',
      '21',
      '22',
      '23',
    ]);
    expect(screen.queryByLabelText('Page 1')).toBeNull();
    expect(screen.queryByLabelText('Page 41')).toBeNull();
  });

  it('keeps five page buttons when the current page is the last page', async () => {
    mountPagination({page: 40, pageSize: 20, totalEntries: 820, totalPages: 41});

    await waitFor(() => expect(screen.getByLabelText('Page 41')).toBeDefined());
    expect(screen.getAllByRole('button', {name: /^Page \d+$/}).map((b) => b.textContent)).toEqual([
      '37',
      '38',
      '39',
      '40',
      '41',
    ]);
  });
});

describe('Sort', () => {
  const bindings = {
    appliedSort: {path: '/state/root/appliedSort'},
    availableSorts: {path: '/state/root/availableSorts'},
  };

  function mountSort(state: {appliedSort: unknown; availableSorts: unknown[]}) {
    return mountSurface({
      component: {component: 'Sort', ...bindings},
      dataModel: [
        {path: '/state/root/appliedSort', value: state.appliedSort},
        {path: '/state/root/availableSorts', value: state.availableSorts},
      ],
    });
  }

  it('renders a select with available sort options', async () => {
    mountSort({
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
        {sortCriteria: 'price_desc', fields: [{field: 'ec_price', direction: 'desc'}]},
      ],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    expect(screen.getByText('Relevance')).toBeDefined();
    expect(screen.getByText('Price (Low to High)')).toBeDefined();
    expect(screen.getByText('Price (High to Low)')).toBeDefined();
  });

  it('selects the applied sort option', async () => {
    mountSort({
      appliedSort: {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      ],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    expect((screen.getByLabelText('Sort by:') as HTMLSelectElement).value).toBe('1');
  });

  it('dispatches a selectSort action when a different sort is selected', async () => {
    const {lastAction} = mountSort({
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      ],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Sort by:'), {target: {value: '1'}});

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectSort',
        context: {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      })
    );
  });
});

describe('ProductList', () => {
  it('renders loading state when products are unresolved', async () => {
    // No data-model write for `products` → the `{path}` binding resolves to undefined → loading.
    mountSurface({
      component: {component: 'ProductList', products: {path: '/state/root/products'}},
    });

    await waitFor(() => expect(screen.getByLabelText('Loading product list')).toBeDefined());
  });

  it('renders nothing when products array is empty', async () => {
    const {container} = mountSurface({
      component: {component: 'ProductList', products: {path: '/state/root/products'}},
      dataModel: [{path: '/state/root/products', value: []}],
    });

    await waitFor(() => expect(container.querySelector('[role="list"]')).toBeNull());
  });

  it('renders a product grid with product cards', async () => {
    mountSurface({
      component: {component: 'ProductList', products: {path: '/state/root/products'}},
      dataModel: [
        {
          path: '/state/root/products',
          value: [
            {
              permanentid: 'p1',
              ec_name: 'Trail Shoes',
              ec_brand: 'Nike',
              ec_price: 99.99,
              additionalFields: {},
            },
            {
              permanentid: 'p2',
              ec_name: 'Running Shoes',
              ec_brand: 'Adidas',
              ec_price: 79.99,
              additionalFields: {},
            },
          ],
        },
      ],
    });

    await waitFor(() => expect(screen.getByRole('list', {name: 'Product list'})).toBeDefined());
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Trail Shoes')).toBeDefined();
    expect(screen.getByText('Running Shoes')).toBeDefined();
  });
});
