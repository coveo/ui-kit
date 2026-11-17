import {fireEvent, render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SuggestionSectionGroup} from './SuggestionSectionGroup.js';
import type {SuggestionSection} from './types.js';

describe('SuggestionSectionGroup', () => {
  const testSection: SuggestionSection = {
    id: 'search',
    title: 'Search',
    icon: 'search',
    items: [
      {id: 's1', label: 'Surfboards'},
      {id: 's2', label: 'Wetsuits'},
      {id: 's3', label: 'Kayaks'},
    ],
  };

  const baseProps = {
    section: testSection,
    onSelect: vi.fn(),
  };

  it('renders the section title', () => {
    render(<SuggestionSectionGroup {...baseProps} />);
    expect(screen.getByText('Search')).toBeDefined();
  });

  it('renders the correct number of items', () => {
    render(<SuggestionSectionGroup {...baseProps} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('passes active state to the correct item', () => {
    render(<SuggestionSectionGroup {...baseProps} activeOptionId="suggestion-item-s2" />);
    const activeItem = document.getElementById('suggestion-item-s2');
    expect(activeItem?.getAttribute('aria-selected')).toBe('true');
  });

  it('draws its header action, and remove buttons described for the keyboard', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <SuggestionSectionGroup
        {...baseProps}
        onRemove={onRemove}
        section={{
          ...testSection,
          action: {label: 'Clear', ariaLabel: 'Clear recent searches', onClick},
          removal: {ariaLabel: ({label}) => `Remove ${label}`, onRemove: vi.fn()},
        }}
      />
    );

    fireEvent.click(screen.getByRole('option', {name: 'Clear recent searches'}));
    fireEvent.click(screen.getByRole('button', {name: 'Remove Wetsuits'}));

    expect(onClick).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledWith({id: 's2', label: 'Wetsuits'});
    expect(screen.getByRole('group', {name: 'Search'})).toBeDefined();
    expect(screen.getAllByRole('option')[1].getAttribute('aria-describedby')).toBe(
      'section-search-removal-hint'
    );
    expect(document.getElementById('section-search-removal-hint')?.textContent).toMatch(
      /Shift\+Delete/
    );
  });

  it('has role="group" with aria-labelledby pointing to section header', () => {
    render(<SuggestionSectionGroup {...baseProps} />);
    const group = screen.getByRole('group');
    expect(group.getAttribute('aria-labelledby')).toBe('section-search-header');
  });
});
