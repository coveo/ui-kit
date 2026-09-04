import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {PageSizeSelector} from './PageSizeSelector.js';

const mockDispatch = vi.fn().mockResolvedValue(undefined);
let mockControllerState: unknown = undefined;

vi.mock('../controllers.js', () => ({
  useRemoteController: () => ({
    state: mockControllerState,
    dispatch: mockDispatch,
    subscribe: () => () => undefined,
  }),
}));

vi.mock('../state-source-context.js', () => ({
  useStateSource: () => ({}),
}));

const props = {componentId: 'pagination-1', componentType: 'pagination' as const};

beforeEach(() => {
  mockControllerState = undefined;
  mockDispatch.mockClear();
});

describe('PageSizeSelector', () => {
  it('renders nothing when state is undefined (loading)', () => {
    mockControllerState = undefined;
    const {container} = render(<PageSizeSelector props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the default page size options', () => {
    mockControllerState = {page: 0, pageSize: 24, totalEntries: 100, totalPages: 5};
    render(<PageSizeSelector props={props} />);

    expect(screen.getByText('Products per page:')).toBeDefined();
    expect(screen.getByRole('option', {name: '12'})).toBeDefined();
    expect(screen.getByRole('option', {name: '24'})).toBeDefined();
    expect(screen.getByRole('option', {name: '48'})).toBeDefined();
  });

  it('shows the current pageSize as selected', () => {
    mockControllerState = {page: 0, pageSize: 48, totalEntries: 100, totalPages: 3};
    render(<PageSizeSelector props={props} />);

    const select = screen.getByLabelText('Products per page:') as HTMLSelectElement;
    expect(select.value).toBe('48');
  });

  it('includes the current pageSize in the options when not a default', () => {
    mockControllerState = {page: 0, pageSize: 36, totalEntries: 100, totalPages: 3};
    render(<PageSizeSelector props={props} />);

    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    expect(options).toEqual(['12', '24', '36', '48']);
  });

  it('dispatches setPageSize with the new size on change', () => {
    mockControllerState = {page: 0, pageSize: 24, totalEntries: 100, totalPages: 5};
    render(<PageSizeSelector props={props} />);

    const select = screen.getByLabelText('Products per page:');
    fireEvent.change(select, {target: {value: '48'}});

    expect(mockDispatch).toHaveBeenCalledWith('setPageSize', {pageSize: 48});
  });
});
