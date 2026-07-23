import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SuggestionsDropdown} from './SuggestionsDropdown.js';
import type {SuggestionSection} from './types.js';

const testSections: SuggestionSection[] = [
  {
    id: 'search',
    title: 'Search',
    icon: 'search',
    items: [
      {id: 's1', label: 'Surfboards'},
      {id: 's2', label: 'Wetsuits'},
    ],
  },
  {
    id: 'conversational',
    title: 'Conversational',
    icon: 'sparkle',
    items: [
      {
        id: 'c1',
        label: 'Build a beginner surfing kit',
        subtitle: 'Surfing / Budget options',
      },
    ],
  },
];

describe('SuggestionsDropdown', () => {
  it('renders all sections and items when visible', () => {
    render(
      <SuggestionsDropdown
        sections={testSections}
        onSelect={vi.fn()}
        visible={true}
      />
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByText('Surfboards')).toBeDefined();
    expect(screen.getByText('Wetsuits')).toBeDefined();
    expect(screen.getByText('Build a beginner surfing kit')).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const {container} = render(
      <SuggestionsDropdown
        sections={testSections}
        onSelect={vi.fn()}
        visible={false}
      />
    );
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });

  it('returns null when sections is empty', () => {
    const {container} = render(
      <SuggestionsDropdown sections={[]} onSelect={vi.fn()} visible={true} />
    );
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });

  it('preserves section order', () => {
    render(
      <SuggestionsDropdown
        sections={testSections}
        onSelect={vi.fn()}
        visible={true}
      />
    );
    const options = screen.getAllByRole('option');
    expect(options[0].textContent).toContain('Surfboards');
    expect(options[1].textContent).toContain('Wetsuits');
    expect(options[2].textContent).toContain('Build a beginner surfing kit');
  });

  it('has role="listbox"', () => {
    render(
      <SuggestionsDropdown
        sections={testSections}
        onSelect={vi.fn()}
        visible={true}
      />
    );
    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('calls onSelect with item and sectionId on item click', () => {
    const onSelect = vi.fn();
    render(
      <SuggestionsDropdown
        sections={testSections}
        onSelect={onSelect}
        visible={true}
      />
    );
    const surfboardsOption = screen
      .getByText('Surfboards')
      .closest('[role="option"]')!;
    fireEvent.mouseDown(surfboardsOption);
    expect(onSelect).toHaveBeenCalledWith(
      {id: 's1', label: 'Surfboards'},
      'search'
    );
  });
});
