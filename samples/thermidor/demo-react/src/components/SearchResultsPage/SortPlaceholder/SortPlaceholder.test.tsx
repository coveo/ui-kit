import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SortPlaceholder} from './SortPlaceholder.js';

describe('SortPlaceholder', () => {
  it('shows "Sort by:" label and "Relevance" option', () => {
    render(<SortPlaceholder onToast={vi.fn()} />);

    expect(screen.getByText('Sort by:')).toBeDefined();
    expect(screen.getByLabelText('Sort by:')).toBeDefined();
    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('relevance');
  });

  it('triggers onToast callback on click', () => {
    const onToast = vi.fn();
    render(<SortPlaceholder onToast={onToast} />);

    fireEvent.click(screen.getByLabelText('Sort by:'));

    expect(onToast).toHaveBeenCalledOnce();
  });
});
