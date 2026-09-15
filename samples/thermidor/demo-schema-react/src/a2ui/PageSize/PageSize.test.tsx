import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {PageSizeRenderer} from './PageSize.js';

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

const props = {componentId: 'page-size-2', componentType: 'page-size' as const};

beforeEach(() => {
  mockControllerState = undefined;
  mockDispatch.mockClear();
});

describe('PageSizeRenderer', () => {
  it('renders nothing when state is undefined (loading)', () => {
    mockControllerState = undefined;
    const {container} = render(<PageSizeRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the default page size options', () => {
    mockControllerState = {pageSize: 24};
    render(<PageSizeRenderer props={props} />);

    expect(screen.getByText('Products per page:')).toBeDefined();
    expect(screen.getByRole('option', {name: '12'})).toBeDefined();
    expect(screen.getByRole('option', {name: '24'})).toBeDefined();
    expect(screen.getByRole('option', {name: '48'})).toBeDefined();
  });

  it('shows the current pageSize as selected', () => {
    mockControllerState = {pageSize: 48};
    render(<PageSizeRenderer props={props} />);

    const select = screen.getByLabelText('Products per page:') as HTMLSelectElement;
    expect(select.value).toBe('48');
  });

  it('includes the current pageSize in the options when not a default', () => {
    mockControllerState = {pageSize: 36};
    render(<PageSizeRenderer props={props} />);

    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    expect(options).toEqual(['12', '24', '36', '48']);
  });

  it('dispatches setPageSize with the new size on change', () => {
    mockControllerState = {pageSize: 24};
    render(<PageSizeRenderer props={props} />);

    const select = screen.getByLabelText('Products per page:');
    fireEvent.change(select, {target: {value: '48'}});

    expect(mockDispatch).toHaveBeenCalledWith('setPageSize', {pageSize: 48});
  });
});
