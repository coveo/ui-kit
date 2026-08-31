import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {PaginationRenderer} from './Pagination/Pagination.js';
import {SortRenderer} from './Sort/Sort.js';
import {SearchBoxRenderer} from './SearchBox/SearchBox.js';
import {ProductListRenderer} from './ProductList/ProductList.js';
import {TargetingProvider, type TargetingContext} from '../context/targeting.js';

const mockDispatch = vi.fn().mockResolvedValue(undefined);
let mockControllerState: unknown = undefined;

vi.mock('./controllers.js', () => ({
  useRemoteController: () => ({
    state: mockControllerState,
    dispatch: mockDispatch,
    subscribe: () => () => undefined,
  }),
}));

vi.mock('./state-source-context.js', () => ({
  useStateSource: () => ({}),
}));

const defaultTargeting: TargetingContext = {
  isTargeting: false,
  onProductTargeted: vi.fn(),
  selectedProductIds: new Set(),
};

function renderWithTargeting(ui: React.ReactElement) {
  return render(<TargetingProvider value={defaultTargeting}>{ui}</TargetingProvider>);
}

beforeEach(() => {
  mockControllerState = undefined;
  mockDispatch.mockClear();
});

describe('PaginationRenderer', () => {
  const props = {componentId: 'test-pagination', componentType: 'pagination' as const};

  it('renders nothing when state is undefined (loading)', () => {
    mockControllerState = undefined;
    const {container} = render(<PaginationRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders page buttons from state', () => {
    mockControllerState = {page: 1, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    expect(screen.getByLabelText('Pagination')).toBeDefined();
    expect(screen.getByLabelText('Page 1')).toBeDefined();
    expect(screen.getByLabelText('Page 2')).toBeDefined();
    expect(screen.getByLabelText('Page 3')).toBeDefined();
  });

  it('marks the current page as active', () => {
    mockControllerState = {page: 1, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    expect(screen.getByLabelText('Page 2').getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('Page 1').getAttribute('aria-current')).toBeNull();
  });

  it('dispatches selectPage when a page button is clicked', () => {
    mockControllerState = {page: 0, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPage', {page: 2});
  });

  it('dispatches selectPage with next page on next button click', () => {
    mockControllerState = {page: 0, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPage', {page: 1});
  });

  it('dispatches selectPage with previous page on previous button click', () => {
    mockControllerState = {page: 2, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(mockDispatch).toHaveBeenCalledWith('selectPage', {page: 1});
  });

  it('disables previous button on first page', () => {
    mockControllerState = {page: 0, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    const prevButton = screen.getByLabelText('Previous page') as HTMLButtonElement;
    expect(prevButton.disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    mockControllerState = {page: 2, pageSize: 10, totalEntries: 30, totalPages: 3};
    render(<PaginationRenderer props={props} />);

    const nextButton = screen.getByLabelText('Next page') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });
});

describe('SortRenderer', () => {
  const props = {componentId: 'test-sort', componentType: 'sort' as const};

  it('renders nothing when state is undefined (loading)', () => {
    mockControllerState = undefined;
    const {container} = render(<SortRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a select with available sort options', () => {
    mockControllerState = {
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
        {sortCriteria: 'price_desc', fields: [{field: 'ec_price', direction: 'desc'}]},
      ],
    };
    render(<SortRenderer props={props} />);

    expect(screen.getByLabelText('Sort by:')).toBeDefined();
    expect(screen.getByText('Relevance')).toBeDefined();
    expect(screen.getByText('Price (Low to High)')).toBeDefined();
    expect(screen.getByText('Price (High to Low)')).toBeDefined();
  });

  it('selects the applied sort option', () => {
    mockControllerState = {
      appliedSort: {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      ],
    };
    render(<SortRenderer props={props} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('1');
  });

  it('dispatches selectSort when a different sort is selected', () => {
    mockControllerState = {
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: [{field: 'ec_price', direction: 'asc'}]},
      ],
    };
    render(<SortRenderer props={props} />);

    const select = screen.getByLabelText('Sort by:');
    fireEvent.change(select, {target: {value: '1'}});

    expect(mockDispatch).toHaveBeenCalledWith('selectSort', {
      sortCriteria: 'price_asc',
      fields: [{field: 'ec_price', direction: 'asc'}],
    });
  });
});

describe('SearchBoxRenderer', () => {
  const props = {componentId: 'test-search-box', componentType: 'search-box' as const};

  it('renders nothing when state is undefined (loading)', () => {
    mockControllerState = undefined;
    const {container} = render(<SearchBoxRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders search input with the query from state', () => {
    mockControllerState = {query: 'shoes'};
    render(<SearchBoxRenderer props={props} />);

    const input = screen.getByLabelText('Search') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('shoes');
  });

  it('dispatches submitQuery on form submission', () => {
    mockControllerState = {query: ''};
    render(<SearchBoxRenderer props={props} />);

    const input = screen.getByLabelText('Search');
    fireEvent.change(input, {target: {value: 'running shoes'}});
    fireEvent.submit(screen.getByRole('search'));

    expect(mockDispatch).toHaveBeenCalledWith('submitQuery', {query: 'running shoes'});
  });

  it('dispatches submitQuery with updated input value on submit button click', () => {
    mockControllerState = {query: 'initial'};
    render(<SearchBoxRenderer props={props} />);

    const input = screen.getByLabelText('Search');
    fireEvent.change(input, {target: {value: 'updated query'}});
    fireEvent.click(screen.getByLabelText('Submit search'));

    expect(mockDispatch).toHaveBeenCalledWith('submitQuery', {query: 'updated query'});
  });
});

describe('ProductListRenderer', () => {
  const props = {componentId: 'test-product-list', componentType: 'product-list' as const};

  it('renders loading state when state is undefined', () => {
    mockControllerState = undefined;
    renderWithTargeting(<ProductListRenderer props={props} />);

    expect(screen.getByLabelText('Loading product list')).toBeDefined();
  });

  it('renders nothing when products array is empty', () => {
    mockControllerState = {products: []};
    const {container} = renderWithTargeting(<ProductListRenderer props={props} />);
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it('renders a product grid with product cards', () => {
    mockControllerState = {
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
    };
    renderWithTargeting(<ProductListRenderer props={props} />);

    const list = screen.getByRole('list', {name: 'Product list'});
    expect(list).toBeDefined();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(screen.getByText('Trail Shoes')).toBeDefined();
    expect(screen.getByText('Running Shoes')).toBeDefined();
  });
});
