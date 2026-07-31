import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {SortFiltersModal} from './SortFiltersModal.js';

// jsdom/happy-dom don't implement showModal/close on <dialog>.
// Mock them so we can verify they're called correctly.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('SortFiltersModal', () => {
  it('calls showModal when open transitions to true', () => {
    const {rerender} = render(
      <SortFiltersModal open={false} onClose={vi.fn()} onToast={vi.fn()} />
    );

    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();

    rerender(<SortFiltersModal open={true} onClose={vi.fn()} onToast={vi.fn()} />);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it('calls dialog.close when the close button is clicked', () => {
    render(<SortFiltersModal open={true} onClose={vi.fn()} onToast={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', {name: 'Close'}));

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('calls dialog.close when "View results" button is clicked', () => {
    render(<SortFiltersModal open={true} onClose={vi.fn()} onToast={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', {name: 'View results'}));

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('calls onClose when the dialog fires the native close event', () => {
    const onClose = vi.fn();
    render(<SortFiltersModal open={true} onClose={onClose} onToast={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', {name: 'Close'}));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls dialog.close when open transitions from true to false', () => {
    const {rerender} = render(<SortFiltersModal open={true} onClose={vi.fn()} onToast={vi.fn()} />);

    rerender(<SortFiltersModal open={false} onClose={vi.fn()} onToast={vi.fn()} />);

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('renders the Sort and Filters sections', () => {
    render(<SortFiltersModal open={true} onClose={vi.fn()} onToast={vi.fn()} />);

    expect(screen.getByText('Sort & Filters')).toBeDefined();
    expect(screen.getByText('Sort')).toBeDefined();
    expect(screen.getByText('Filters')).toBeDefined();
    expect(screen.getByText('Filters coming soon')).toBeDefined();
  });

  it('has an accessible aria-label on the dialog', () => {
    render(<SortFiltersModal open={true} onClose={vi.fn()} onToast={vi.fn()} />);

    expect(screen.getByRole('dialog', {name: 'Sort and filters'})).toBeDefined();
  });
});
