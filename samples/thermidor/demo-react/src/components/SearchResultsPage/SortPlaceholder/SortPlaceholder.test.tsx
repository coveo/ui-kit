import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SortPlaceholder} from './SortPlaceholder.js';
import type {SortController, SortControllerState} from '@coveo/thermidor';

function createMockSortController(state: SortControllerState): SortController {
  return {
    state,
    subscribe: vi.fn(() => () => {}),
    sortBy: vi.fn(),
    isSortedBy: vi.fn(),
  };
}

describe('SortPlaceholder', () => {
  it('renders a disabled select with Relevance when availableSorts is empty', () => {
    const controller = createMockSortController({
      appliedSort: null,
      availableSorts: [],
    });
    render(<SortPlaceholder controller={controller} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(select.value).toBe('relevance');
  });

  it('renders a select with available sort options', () => {
    const controller = createMockSortController({
      appliedSort: {sortCriteria: 'relevancy'},
      availableSorts: [
        {sortCriteria: 'relevancy'},
        {sortCriteria: 'date ascending'},
        {sortCriteria: '@price descending'},
      ],
    });
    render(<SortPlaceholder controller={controller} />);

    expect(screen.getByText('Sort by:')).toBeDefined();
    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('relevancy');

    const options = select.querySelectorAll('option');
    expect(options.length).toBe(3);
  });

  it('calls controller.sortBy when selection changes', () => {
    const controller = createMockSortController({
      appliedSort: {sortCriteria: 'relevancy'},
      availableSorts: [{sortCriteria: 'relevancy'}, {sortCriteria: 'date ascending'}],
    });
    render(<SortPlaceholder controller={controller} />);

    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    fireEvent.change(select, {target: {value: 'date ascending'}});

    expect(controller.sortBy).toHaveBeenCalledWith({
      sortCriteria: 'date ascending',
    });
  });
});
