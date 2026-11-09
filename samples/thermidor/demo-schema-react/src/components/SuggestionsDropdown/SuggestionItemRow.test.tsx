import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SuggestionItemRow} from './SuggestionItemRow.js';

describe('SuggestionItemRow', () => {
  const baseProps = {
    item: {id: 's1', label: 'Surfboards'},
    icon: 'search' as const,
    isActive: false,
    onSelect: vi.fn(),
    id: 'suggestion-s1',
  };

  it('renders the item label text', () => {
    render(<SuggestionItemRow {...baseProps} />);
    expect(screen.getByText('Surfboards')).toBeDefined();
  });

  it('renders subtitle when provided', () => {
    const props = {
      ...baseProps,
      item: {
        id: 'c1',
        label: 'Build a beginner surfing kit',
        subtitle: 'Surfing / Budget options',
      },
    };
    render(<SuggestionItemRow {...props} />);
    expect(screen.getByText('Surfing / Budget options')).toBeDefined();
  });

  it('does not render subtitle when absent', () => {
    render(<SuggestionItemRow {...baseProps} />);
    const option = screen.getByRole('option');
    expect(option.querySelectorAll('span')).toHaveLength(1);
  });

  it('renders section icon inline', () => {
    render(<SuggestionItemRow {...baseProps} />);
    const option = screen.getByRole('option');
    const svg = option.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies active class when isActive is true', () => {
    render(<SuggestionItemRow {...baseProps} isActive={true} />);
    const option = screen.getByRole('option');
    expect(option.getAttribute('aria-selected')).toBe('true');
  });

  it('calls onSelect on mousedown', () => {
    const onSelect = vi.fn();
    render(<SuggestionItemRow {...baseProps} onSelect={onSelect} />);
    const option = screen.getByRole('option');
    fireEvent.mouseDown(option);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('bolds what follows the text it completes', () => {
    render(
      <SuggestionItemRow {...baseProps} item={{id: 'r1', label: 'hiking boots', completes: 'Hi'}} />
    );
    const option = screen.getByRole('option');
    expect(option.textContent).toBe('hiking boots');
    expect(option.querySelector('strong')?.textContent).toBe('king boots');
  });

  it('bolds nothing when the text it completes is empty or not its start', () => {
    const {rerender} = render(
      <SuggestionItemRow {...baseProps} item={{id: 'r1', label: 'hiking boots', completes: ''}} />
    );
    expect(screen.getByRole('option').querySelector('strong')).toBeNull();

    rerender(
      <SuggestionItemRow {...baseProps} item={{id: 'r1', label: 'hiking boots', completes: 'bo'}} />
    );
    expect(screen.getByRole('option').querySelector('strong')).toBeNull();
  });

  it('draws a named remove button outside the option and the tab order', () => {
    const onRemove = vi.fn();
    const onSelect = vi.fn();
    render(
      <SuggestionItemRow
        {...baseProps}
        onSelect={onSelect}
        onRemove={onRemove}
        removeLabel="Remove Surfboards from recent searches"
      />
    );
    const button = screen.getByRole('button', {name: 'Remove Surfboards from recent searches'});

    expect(screen.getByRole('option').contains(button)).toBe(false);
    expect(button.tabIndex).toBe(-1);
    fireEvent.mouseDown(button);
    fireEvent.click(button);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('has role="option"', () => {
    render(<SuggestionItemRow {...baseProps} />);
    expect(screen.getByRole('option')).toBeDefined();
  });
});
