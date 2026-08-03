import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {Sort} from './Sort.js';
import type {SortController, SortControllerState} from '@coveo/thermidor';

function createMockSortController(
  state: SortControllerState<any>,
  appliedCriterion?: any
): SortController<any> {
  return {
    state,
    subscribe: vi.fn(() => () => {}),
    sortBy: vi.fn(),
    isSortedBy: vi.fn((criterion) => {
      if (!appliedCriterion) return false;
      return JSON.stringify(appliedCriterion) === JSON.stringify(criterion);
    }),
  };
}

describe('Sort', () => {
  it('renders a select with static sort options', () => {
    const controller = createMockSortController({
      appliedSort: null,
      availableSorts: [],
    });
    render(<Sort controller={controller} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.disabled).toBeFalsy();

    const options = select.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toBe('Relevance');
    expect(options[1].textContent).toBe('Price (Low to High)');
    expect(options[2].textContent).toBe('Price (High to Low)');
  });

  it('selects the matching option based on isSortedBy', () => {
    const applied = {by: 'field', field: 'ec_price', direction: 'descending'};
    const controller = createMockSortController(
      {appliedSort: applied, availableSorts: []},
      applied
    );
    render(<Sort controller={controller} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('calls controller.sortBy when selection changes', () => {
    const controller = createMockSortController(
      {
        appliedSort: {by: 'relevance'},
        availableSorts: [],
      },
      {by: 'relevance'}
    );
    render(<Sort controller={controller} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '1'}});

    expect(controller.sortBy).toHaveBeenCalledWith({
      by: 'field',
      field: 'ec_price',
      direction: 'ascending',
    });
  });
});
