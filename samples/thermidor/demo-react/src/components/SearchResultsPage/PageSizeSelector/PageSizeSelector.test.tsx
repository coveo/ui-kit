import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {PaginationController} from '@coveo/thermidor';
import {PageSizeSelector} from './PageSizeSelector.js';

function createMockController(state: {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}) {
  return {
    state,
    subscribe: () => () => {},
    selectPage: vi.fn(),
    setPageSize: vi.fn(),
  } as unknown as PaginationController;
}

describe('PageSizeSelector', () => {
  it('renders select with options 10, 25, 50', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 100,
      totalPages: 10,
    });

    render(<PageSizeSelector controller={controller} />);

    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('10');
    expect(options[1].value).toBe('25');
    expect(options[2].value).toBe('50');
  });

  it('reflects current pageSize as selected value', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 25,
      totalCount: 100,
      totalPages: 4,
    });

    render(<PageSizeSelector controller={controller} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('25');
  });

  it('calls setPageSize with new value on change', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 100,
      totalPages: 10,
    });

    render(<PageSizeSelector controller={controller} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, {target: {value: '50'}});

    expect(controller.setPageSize).toHaveBeenCalledWith(50);
  });

  it('calls selectPage(0) on change', () => {
    const controller = createMockController({
      page: 3,
      pageSize: 10,
      totalCount: 100,
      totalPages: 10,
    });

    render(<PageSizeSelector controller={controller} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, {target: {value: '25'}});

    expect(controller.selectPage).toHaveBeenCalledWith(0);
  });

  it('has accessible label "Products per page:"', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 100,
      totalPages: 10,
    });

    render(<PageSizeSelector controller={controller} />);

    expect(screen.getByLabelText('Products per page:')).toBeDefined();
  });
});
