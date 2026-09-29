import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import type {PaginationProps, SortProps, ProductListProps} from '@coveo/thermidor-schema';
import {PaginationRenderer} from './Pagination/Pagination.js';
import {SortRenderer} from './Sort/Sort.js';
import {ProductListRenderer} from './ProductList/ProductList.js';
import {TargetingProvider, type TargetingContext} from '../context/targeting.js';

const defaultTargeting: TargetingContext = {
  isTargeting: false,
  onProductTargeted: vi.fn(),
  selectedProductIds: new Set(),
};

function renderWithTargeting(ui: React.ReactElement) {
  return render(<TargetingProvider value={defaultTargeting}>{ui}</TargetingProvider>);
}

afterEach(() => cleanup());

describe('PaginationRenderer', () => {
  function renderPagination(props: PaginationProps, dispatch = vi.fn()) {
    return {dispatch, ...render(<PaginationRenderer props={props} dispatch={dispatch} />)};
  }

  it('renders page buttons from resolved props', () => {
    renderPagination({page: 1, pageSize: 10, totalEntries: 30, totalPages: 3});

    expect(screen.getByLabelText('Pagination')).toBeDefined();
    expect(screen.getByLabelText('Page 1')).toBeDefined();
    expect(screen.getByLabelText('Page 2')).toBeDefined();
    expect(screen.getByLabelText('Page 3')).toBeDefined();
  });

  it('marks the current page as active', () => {
    renderPagination({page: 1, pageSize: 10, totalEntries: 30, totalPages: 3});

    expect(screen.getByLabelText('Page 2').getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('Page 1').getAttribute('aria-current')).toBeNull();
  });

  it('dispatches a selectPage action when a page button is clicked', () => {
    const {dispatch} = renderPagination({page: 0, pageSize: 10, totalEntries: 30, totalPages: 3});

    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'selectPage', context: {page: 2}}});
  });

  it('dispatches selectPage with next page on next button click', () => {
    const {dispatch} = renderPagination({page: 0, pageSize: 10, totalEntries: 30, totalPages: 3});

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'selectPage', context: {page: 1}}});
  });

  it('dispatches selectPage with previous page on previous button click', () => {
    const {dispatch} = renderPagination({page: 2, pageSize: 10, totalEntries: 30, totalPages: 3});

    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(dispatch).toHaveBeenCalledWith({event: {name: 'selectPage', context: {page: 1}}});
  });

  it('disables previous button on first page', () => {
    renderPagination({page: 0, pageSize: 10, totalEntries: 30, totalPages: 3});

    const prevButton = screen.getByLabelText('Previous page') as HTMLButtonElement;
    expect(prevButton.disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    renderPagination({page: 2, pageSize: 10, totalEntries: 30, totalPages: 3});

    const nextButton = screen.getByLabelText('Next page') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });
});

describe('SortRenderer', () => {
  function renderSort(props: SortProps, dispatch = vi.fn()) {
    return {dispatch, ...render(<SortRenderer props={props} dispatch={dispatch} />)};
  }

  it('renders a select with available sort options', () => {
    renderSort({
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
        {sortCriteria: 'price_desc', fields: [{field: 'ec_price', direction: 'desc'}]},
      ],
    });

    expect(screen.getByLabelText('Sort by:')).toBeDefined();
    expect(screen.getByText('Relevance')).toBeDefined();
    expect(screen.getByText('Price (Low to High)')).toBeDefined();
    expect(screen.getByText('Price (High to Low)')).toBeDefined();
  });

  it('selects the applied sort option', () => {
    renderSort({
      appliedSort: {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      ],
    });

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('1');
  });

  it('dispatches a selectSort action when a different sort is selected', () => {
    const {dispatch} = renderSort({
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      ],
    });

    const select = screen.getByLabelText('Sort by:');
    fireEvent.change(select, {target: {value: '1'}});

    expect(dispatch).toHaveBeenCalledWith({
      event: {
        name: 'selectSort',
        context: {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      },
    });
  });
});

describe('ProductListRenderer', () => {
  it('renders loading state when products are unresolved', () => {
    renderWithTargeting(<ProductListRenderer props={{} as ProductListProps} />);

    expect(screen.getByLabelText('Loading product list')).toBeDefined();
  });

  it('renders nothing when products array is empty', () => {
    const {container} = renderWithTargeting(<ProductListRenderer props={{products: []}} />);
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it('renders a product grid with product cards', () => {
    renderWithTargeting(
      <ProductListRenderer
        props={{
          products: [
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
        }}
      />
    );

    const list = screen.getByRole('list', {name: 'Product list'});
    expect(list).toBeDefined();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(screen.getByText('Trail Shoes')).toBeDefined();
    expect(screen.getByText('Running Shoes')).toBeDefined();
  });
});
