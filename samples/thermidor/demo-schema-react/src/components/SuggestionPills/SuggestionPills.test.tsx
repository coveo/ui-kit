import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SuggestionPills, PROMPT_SUGGESTIONS} from './SuggestionPills.js';

describe('SuggestionPills', () => {
  it('renders all default suggestions as buttons', () => {
    render(<SuggestionPills onSelect={vi.fn()} />);

    for (const suggestion of PROMPT_SUGGESTIONS) {
      expect(screen.getByRole('button', {name: suggestion})).toBeDefined();
    }
  });

  it('calls onSelect with the suggestion text when a pill is clicked', () => {
    const onSelect = vi.fn();
    render(<SuggestionPills onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', {name: 'kayaks'}));

    expect(onSelect).toHaveBeenCalledWith('kayaks');
  });

  it('renders custom suggestions when provided', () => {
    const custom = ['suggestion A', 'suggestion B'];
    render(<SuggestionPills onSelect={vi.fn()} suggestions={custom} />);

    expect(screen.getByRole('button', {name: 'suggestion A'})).toBeDefined();
    expect(screen.getByRole('button', {name: 'suggestion B'})).toBeDefined();
    expect(screen.queryByRole('button', {name: 'kayaks'})).toBeNull();
  });

  it('disables all pills when disabled prop is true', () => {
    render(<SuggestionPills onSelect={vi.fn()} disabled />);

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('does not call onSelect when a disabled pill is clicked', () => {
    const onSelect = vi.fn();
    render(<SuggestionPills onSelect={onSelect} disabled />);

    fireEvent.click(screen.getByRole('button', {name: 'kayaks'}));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('has an accessible group label', () => {
    render(<SuggestionPills onSelect={vi.fn()} />);
    expect(screen.getByRole('group', {name: 'Suggestions'})).toBeDefined();
  });
});
