import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import type {PageSizeProps} from '@coveo/thermidor-schema/zod3';
import {PageSizeRenderer} from './PageSize.js';

type ResolvedProps = PageSizeProps;

function renderPageSize(props: ResolvedProps, dispatch = vi.fn()) {
  return {dispatch, ...render(<PageSizeRenderer props={props} dispatch={dispatch} />)};
}

describe('PageSizeRenderer', () => {
  it('renders the default page size options', () => {
    renderPageSize({pageSize: 24});

    expect(screen.getByText('Products per page:')).toBeDefined();
    expect(screen.getByRole('option', {name: '12'})).toBeDefined();
    expect(screen.getByRole('option', {name: '24'})).toBeDefined();
    expect(screen.getByRole('option', {name: '48'})).toBeDefined();
  });

  it('shows the current pageSize as selected', () => {
    renderPageSize({pageSize: 48});

    const select = screen.getByLabelText('Products per page:') as HTMLSelectElement;
    expect(select.value).toBe('48');
  });

  it('includes the current pageSize in the options when not a default', () => {
    renderPageSize({pageSize: 36});

    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    expect(options).toEqual(['12', '24', '36', '48']);
  });

  it('dispatches a setPageSize A2-UI action with the new size on change', () => {
    const {dispatch} = renderPageSize({pageSize: 24});

    const select = screen.getByLabelText('Products per page:');
    fireEvent.change(select, {target: {value: '48'}});

    expect(dispatch).toHaveBeenCalledWith({
      event: {name: 'setPageSize', context: {pageSize: 48}},
    });
  });
});
