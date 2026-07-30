import {render, screen} from '@testing-library/react';
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
    render(<SuggestionSectionGroup {...baseProps} activeItemId="s2" />);
    const activeItem = document.getElementById('suggestion-item-s2');
    expect(activeItem?.getAttribute('aria-selected')).toBe('true');
  });

  it('has role="group" with aria-labelledby pointing to section header', () => {
    render(<SuggestionSectionGroup {...baseProps} />);
    const group = screen.getByRole('group');
    expect(group.getAttribute('aria-labelledby')).toBe('section-search-header');
  });
});
