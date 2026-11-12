import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor, within} from '@testing-library/react';
import type {ReactNode} from 'react';
import {vi} from 'vitest';
import {mountSurface} from './mount-surface.harness.js';
import {
  ProductCardActionsContext,
  type ProductCardProduct,
} from './ProductCard/product-card-actions.js';

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

  // The sorts Agent Gateway sends: relevance without fields, and each field sort with the Commerce
  // API's displayName on its field.
  const relevance = {sortCriteria: 'relevance', fields: []};
  const priceAscending = {
    sortCriteria: 'fields',
    fields: [{field: 'ec_price', direction: 'asc', displayName: 'Price (Low to High)'}],
  };
  const priceDescending = {
    sortCriteria: 'fields',
    fields: [{field: 'ec_price', direction: 'desc', displayName: 'Price (High to Low)'}],
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

  function optionLabels(): string[] {
    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    return Array.from(select.options).map((option) => option.textContent ?? '');
  }

  it('labels each option with the displayName of its fields', async () => {
    mountSort({
      appliedSort: relevance,
      availableSorts: [relevance, priceAscending, priceDescending],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    expect(optionLabels()).toEqual(['Relevance', 'Price (Low to High)', 'Price (High to Low)']);
  });

  it('joins the displayNames of a sort on several fields', async () => {
    mountSort({
      appliedSort: relevance,
      availableSorts: [
        {
          sortCriteria: 'fields',
          fields: [
            {field: 'ec_brand', direction: 'asc', displayName: 'Brand (A to Z)'},
            {field: 'ec_price', direction: 'asc', displayName: 'Price (Low to High)'},
          ],
        },
      ],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    expect(optionLabels()).toEqual(['Brand (A to Z), Price (Low to High)']);
  });

  it('leaves a field sort without displayName unlabelled', async () => {
    mountSort({
      appliedSort: relevance,
      availableSorts: [
        relevance,
        {sortCriteria: 'fields', fields: [{field: 'ec_price', direction: 'asc'}]},
        {sortCriteria: 'fields', fields: [{field: 'ec_price', direction: 'desc'}]},
      ],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    expect(optionLabels()).toEqual(['Relevance', '', '']);
  });

  it('selects the available sort that the applied sort matches', async () => {
    mountSort({
      appliedSort: priceDescending,
      availableSorts: [relevance, priceAscending, priceDescending],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    expect((screen.getByLabelText('Sort by:') as HTMLSelectElement).value).toBe('2');
  });

  it('dispatches a selectSort action with the typed fields of the selected sort', async () => {
    const {lastAction} = mountSort({
      appliedSort: relevance,
      availableSorts: [relevance, priceAscending, priceDescending],
    });

    await waitFor(() => expect(screen.getByLabelText('Sort by:')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Sort by:'), {target: {value: '1'}});

    await waitFor(() => expect(lastAction()?.name).toBe('selectSort'));
    expect(lastAction()?.context).toEqual(priceAscending);
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
    expect(screen.queryByRole('list', {name: 'Product badges'})).toBeNull();
  });

  it('renders the badges a product has on its card', async () => {
    mountSurface({
      component: {component: 'ProductList', products: {path: '/state/root/products'}},
      dataModel: [
        {
          path: '/state/root/products',
          value: [
            {
              permanentid: 'p1',
              ec_name: 'Trail Shoes',
              additionalFields: {},
              badgePlacements: [
                {
                  placementId: '36164bca-b489-4c42-8574-e1325d56d0be',
                  badges: [{text: 'Bestseller!', backgroundColor: '#ff0000', textColor: '#ffffff'}],
                },
              ],
            },
          ],
        },
      ],
    });

    const badges = await screen.findByRole('list', {name: 'Product badges'});
    expect(badges.textContent).toBe('Bestseller!');
  });
});

// A product with variants, as producers send it: the product first among its variants.
function trailShoe() {
  const variants = [
    {
      permanentid: 'shoe-red',
      ec_name: 'Trail shoe, red',
      ec_price: 120,
      ec_images: ['https://example.com/red.png'],
      ec_thumbnails: ['https://example.com/red-thumb.png'],
      clickUri: 'https://example.com/shoe-red',
      additionalFields: {},
    },
    {
      permanentid: 'shoe-blue',
      ec_name: 'Trail shoe, blue',
      ec_price: 110,
      ec_images: ['https://example.com/blue.png'],
      ec_thumbnails: ['https://example.com/blue-thumb.png'],
      clickUri: 'https://example.com/shoe-blue',
      additionalFields: {},
    },
  ];
  return {...variants[0], children: variants, totalNumberOfChildren: 4};
}

const roadShoe = {permanentid: 'road', ec_name: 'Road shoe', ec_price: 90, additionalFields: {}};

describe('ProductList variants', () => {
  function mountList(renderActions = vi.fn((_: ProductCardProduct) => null as ReactNode)) {
    const surface = mountSurface({
      component: {component: 'ProductList', products: {path: '/state/root/products'}},
      dataModel: [{path: '/state/root/products', value: [trailShoe(), roadShoe]}],
      wrapper: ({children}) => (
        <ProductCardActionsContext.Provider value={renderActions}>
          {children}
        </ProductCardActionsContext.Provider>
      ),
    });
    return {...surface, renderActions};
  }

  const card = (index: number) => screen.getAllByRole('listitem')[index];

  it('shows the variants of a grouped product only', async () => {
    mountList();

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
    const variants = within(card(0)).getByRole('group', {name: 'Variants'});
    expect(
      within(variants)
        .getAllByRole('button')
        .map(({title}) => title)
    ).toEqual(['Trail shoe, red', 'Trail shoe, blue']);
    expect(within(variants).getByLabelText('2 more variants')).toBeDefined();
    expect(within(card(1)).queryByRole('group', {name: 'Variants'})).toBeNull();
  });

  it('swaps a hovered variant into its card, and hands it to the card actions', async () => {
    const {renderActions} = mountList();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));

    fireEvent.mouseEnter(within(card(0)).getByTitle('Trail shoe, blue'));

    expect(within(card(0)).getByRole('heading').textContent).toBe('Trail shoe, blue');
    expect(within(card(0)).getByText('$110.00')).toBeDefined();
    expect(within(card(0)).getAllByRole('img')[0].getAttribute('src')).toBe(
      'https://example.com/blue.png'
    );
    expect(renderActions).toHaveBeenLastCalledWith(
      expect.objectContaining({
        productId: 'shoe-blue',
        name: 'Trail shoe, blue',
        price: 110,
        clickUri: 'https://example.com/shoe-blue',
      })
    );
    expect(within(card(1)).getByRole('heading').textContent).toBe('Road shoe');
  });

  it('shows the first variant again when the products are sent again', async () => {
    const {pushDataModel} = mountList();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
    fireEvent.mouseEnter(within(card(0)).getByTitle('Trail shoe, blue'));

    pushDataModel([{path: '/state/root/products', value: [trailShoe(), roadShoe]}]);

    await waitFor(() =>
      expect(within(card(0)).getByRole('heading').textContent).toBe('Trail shoe, red')
    );
  });
});

describe('ProductCarousel variants', () => {
  it('links the card to the variant it shows', async () => {
    mountSurface({
      component: {
        component: 'ProductCarousel',
        heading: {path: '/state/root/heading'},
        products: {path: '/state/root/products'},
      },
      dataModel: [
        {path: '/state/root/heading', value: 'Shoes'},
        {path: '/state/root/products', value: [trailShoe(), roadShoe]},
      ],
    });
    const link = await screen.findByRole('link', {name: 'Trail shoe, red'});
    expect(link.getAttribute('href')).toBe('https://example.com/shoe-red');
    expect(screen.getAllByRole('group', {name: 'Variants'})).toHaveLength(1);

    fireEvent.touchStart(screen.getByTitle('Trail shoe, blue'));

    expect(screen.getByRole('link', {name: 'Trail shoe, blue'}).getAttribute('href')).toBe(
      'https://example.com/shoe-blue'
    );
    expect(screen.getByText('$110.00')).toBeDefined();
  });
});
