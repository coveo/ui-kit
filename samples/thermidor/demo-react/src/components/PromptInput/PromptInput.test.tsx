import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {PromptInput} from './PromptInput.js';
import type {SuggestionSection} from '../SuggestionsDropdown/index.js';

describe('PromptInput', () => {
  it('renders a textarea with the provided placeholder', () => {
    render(<PromptInput onSubmit={vi.fn()} placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeDefined();
  });

  it('calls onSubmit with trimmed value when Enter is pressed', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: '  hello world  '}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('does not submit on Shift+Enter (allows multiline)', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: 'hello'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter', shiftKey: true});

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when the submit button is clicked', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: 'search query'}});
    fireEvent.click(screen.getByLabelText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith('search query');
  });

  it('retains the textarea value after submission', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.change(textarea, {target: {value: 'query'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(textarea.value).toBe('query');
  });

  it('does not submit when input is empty or whitespace-only', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: '   '}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables textarea and submit button when disabled prop is true', () => {
    render(<PromptInput onSubmit={vi.fn()} disabled />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    const button = screen.getByLabelText('Submit') as HTMLButtonElement;

    expect(textarea.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('disables submit button when textarea is empty', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    const button = screen.getByLabelText('Submit') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('renders with initialValue pre-filled', () => {
    render(<PromptInput onSubmit={vi.fn()} initialValue="prefilled" />);
    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    expect(textarea.value).toBe('prefilled');
  });
});

const testSuggestions: SuggestionSection[] = [
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

describe('suggestions integration', () => {
  it('shows dropdown on focus when suggestions are provided', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('hides dropdown on blur', () => {
    vi.useFakeTimers();

    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    expect(screen.getByRole('listbox')).toBeDefined();

    fireEvent.blur(textarea);
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.queryByRole('listbox')).toBeNull();

    vi.useRealTimers();
  });

  it('does not render dropdown when suggestions are not provided', () => {
    render(<PromptInput onSubmit={vi.fn()} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('hides dropdown on Escape key', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    expect(screen.getByRole('listbox')).toBeDefined();

    fireEvent.keyDown(textarea, {key: 'Escape'});

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('ArrowDown increments activeIndex', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});

    expect(textarea.getAttribute('aria-activedescendant')).toBe(
      'suggestion-item-s1'
    );
  });

  it('ArrowUp decrements activeIndex', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe(
      'suggestion-item-s2'
    );

    fireEvent.keyDown(textarea, {key: 'ArrowUp'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe(
      'suggestion-item-s1'
    );
  });

  it('Enter selects the active item', async () => {
    const onSuggestionSelect = vi.fn();
    render(
      <PromptInput
        onSubmit={vi.fn()}
        suggestions={testSuggestions}
        onSuggestionSelect={onSuggestionSelect}
      />
    );

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'Enter'});

    await waitFor(() => {
      expect(onSuggestionSelect).toHaveBeenCalledWith(
        {id: 's1', label: 'Surfboards'},
        'search'
      );
    });
  });

  it('calls onSuggestionSelect with item and sectionId', async () => {
    const onSuggestionSelect = vi.fn();
    render(
      <PromptInput
        onSubmit={vi.fn()}
        suggestions={testSuggestions}
        onSuggestionSelect={onSuggestionSelect}
      />
    );

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    // Navigate to third item (first item of conversational section)
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'Enter'});

    await waitFor(() => {
      expect(onSuggestionSelect).toHaveBeenCalledWith(
        {
          id: 'c1',
          label: 'Build a beginner surfing kit',
          subtitle: 'Surfing / Budget options',
        },
        'conversational'
      );
    });
  });

  it('sets aria-activedescendant when item is highlighted', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    expect(textarea.getAttribute('aria-activedescendant')).toBeNull();

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe(
      'suggestion-item-s1'
    );
  });

  it('removes aria-activedescendant when dropdown is hidden', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe(
      'suggestion-item-s1'
    );

    fireEvent.keyDown(textarea, {key: 'Escape'});
    expect(textarea.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('resets activeIndex to -1 on dropdown open', () => {
    vi.useFakeTimers();

    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe(
      'suggestion-item-s1'
    );

    // Close and re-open
    fireEvent.blur(textarea);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    fireEvent.focus(textarea);

    expect(textarea.getAttribute('aria-activedescendant')).toBeNull();

    vi.useRealTimers();
  });
});

describe('ARIA combobox pattern', () => {
  it('textarea has role="combobox"', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const combobox = screen.getByRole('combobox', {name: 'Prompt'});
    expect(combobox).toBeDefined();
  });

  it('sets aria-expanded=false when dropdown is closed', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    expect(textarea.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets aria-expanded=true when dropdown is open', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    fireEvent.focus(textarea);

    expect(textarea.getAttribute('aria-expanded')).toBe('true');
  });

  it('has aria-haspopup="listbox"', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    expect(textarea.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('has aria-controls pointing to the listbox id', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    expect(textarea.getAttribute('aria-controls')).toBe('suggestions-listbox');
  });

  it('listbox has the matching id', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    fireEvent.focus(textarea);

    const listbox = screen.getByRole('listbox');
    expect(listbox.id).toBe('suggestions-listbox');
  });
});

describe('disabled + focus interaction', () => {
  it('does not show dropdown when disabled even with suggestions provided', () => {
    render(
      <PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} disabled />
    );

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    fireEvent.focus(textarea);

    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
