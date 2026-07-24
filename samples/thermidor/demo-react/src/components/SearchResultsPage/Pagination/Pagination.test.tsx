import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {PaginationController} from '@coveo/thermidor';
import {Pagination} from './Pagination.js';

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
  } as unknown as PaginationController;
}

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 5,
      totalPages: 1,
    });

    const {container} = render(<Pagination controller={controller} />);

    expect(container.querySelector('nav')).toBeNull();
  });

  it('calls selectPage with correct zero-indexed page on numbered button click', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 30,
      totalPages: 3,
    });

    render(<Pagination controller={controller} />);

    const page2Button = screen.getByRole('button', {name: '2'});
    fireEvent.click(page2Button);

    expect(controller.selectPage).toHaveBeenCalledWith(1);
  });

  it('disables Previous on first page', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 30,
      totalPages: 3,
    });

    render(<Pagination controller={controller} />);

    const prevButton = screen.getByRole('button', {name: 'Previous page'});
    expect(prevButton).toHaveProperty('disabled', true);
  });

  it('disables Next on last page', () => {
    const controller = createMockController({
      page: 2,
      pageSize: 10,
      totalCount: 30,
      totalPages: 3,
    });

    render(<Pagination controller={controller} />);

    const nextButton = screen.getByRole('button', {name: 'Next page'});
    expect(nextButton).toHaveProperty('disabled', true);
  });

  it('enables both buttons when on a middle page', () => {
    const controller = createMockController({
      page: 1,
      pageSize: 10,
      totalCount: 30,
      totalPages: 3,
    });

    render(<Pagination controller={controller} />);

    const prevButton = screen.getByRole('button', {name: 'Previous page'});
    const nextButton = screen.getByRole('button', {name: 'Next page'});
    expect(prevButton).toHaveProperty('disabled', false);
    expect(nextButton).toHaveProperty('disabled', false);
  });

  it('shows ellipsis when totalPages > 5', () => {
    const controller = createMockController({
      page: 0,
      pageSize: 10,
      totalCount: 100,
      totalPages: 10,
    });

    render(<Pagination controller={controller} />);

    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
