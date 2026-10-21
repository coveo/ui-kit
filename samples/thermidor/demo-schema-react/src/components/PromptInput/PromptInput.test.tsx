import {render, screen, fireEvent, act} from '@testing-library/react';
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

  it('keeps the textarea usable but holds the submit when busy', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} busy />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.change(textarea, {target: {value: 'query'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(textarea.disabled).toBe(false);
    expect((screen.getByLabelText('Submit') as HTMLButtonElement).disabled).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onValueChange with what is typed or cleared', () => {
    const onValueChange = vi.fn();
    render(<PromptInput onSubmit={vi.fn()} onValueChange={onValueChange} />);

    fireEvent.change(screen.getByLabelText('Prompt'), {target: {value: 'surf'}});
    fireEvent.click(screen.getByLabelText('Clear'));

    expect(onValueChange.mock.calls).toEqual([['surf'], ['']]);
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

    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s1');
  });

  it('ArrowUp decrements activeIndex', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s2');

    fireEvent.keyDown(textarea, {key: 'ArrowUp'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s1');
  });

  it('Enter submits the active item', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('Surfboards');
    expect(textarea.value).toBe('Surfboards');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('submits a clicked item, across sections, and clears it when clearOnSubmit is set', () => {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    render(
      <PromptInput
        onSubmit={onSubmit}
        suggestions={testSuggestions}
        onValueChange={onValueChange}
        clearOnSubmit
      />
    );

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.mouseDown(screen.getByRole('option', {name: /Build a beginner surfing kit/}));

    expect(onSubmit).toHaveBeenCalledWith('Build a beginner surfing kit');
    expect(textarea.value).toBe('');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps a selected item in the input without submitting it when busy', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} suggestions={testSuggestions} busy />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.mouseDown(screen.getByRole('option', {name: /Surfboards/}));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea.value).toBe('Surfboards');
  });

  it('opens the dropdown when suggestions arrive while the textarea has focus', () => {
    const {rerender} = render(<PromptInput onSubmit={vi.fn()} suggestions={[]} />);

    const textarea = screen.getByLabelText('Prompt');
    textarea.focus();
    expect(textarea.getAttribute('aria-expanded')).toBe('false');

    rerender(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    expect(screen.getByRole('listbox')).toBeDefined();
    expect(textarea.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not open the dropdown when suggestions arrive without focus', () => {
    const {rerender} = render(<PromptInput onSubmit={vi.fn()} suggestions={[]} />);

    rerender(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('reports the dropdown collapsed once its suggestions are gone', () => {
    const {rerender} = render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    textarea.focus();
    rerender(<PromptInput onSubmit={vi.fn()} suggestions={[]} />);

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(textarea.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the dropdown above the input when placed above', () => {
    render(
      <PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} suggestionsPlacement="above" />
    );

    fireEvent.focus(screen.getByLabelText('Prompt'));

    expect(screen.getByRole('listbox').className).toMatch(/above/);
  });

  it('sets aria-activedescendant when item is highlighted', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    expect(textarea.getAttribute('aria-activedescendant')).toBeNull();

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s1');
  });

  it('removes aria-activedescendant when dropdown is hidden', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s1');

    fireEvent.keyDown(textarea, {key: 'Escape'});
    expect(textarea.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('resets activeIndex to -1 on dropdown open', () => {
    vi.useFakeTimers();

    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s1');

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

describe('busy + focus interaction', () => {
  it('shows the dropdown on focus when busy', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} busy />);

    const textarea = screen.getByRole('combobox', {name: 'Prompt'});
    fireEvent.focus(textarea);

    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('updates textarea value when initialValue prop changes', () => {
    const {rerender} = render(<PromptInput onSubmit={vi.fn()} initialValue="surfboards" />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    expect(textarea.value).toBe('surfboards');

    rerender(<PromptInput onSubmit={vi.fn()} initialValue="" />);
    expect(textarea.value).toBe('');
  });

  it('does not reset user-typed value when initialValue stays the same across rerenders', () => {
    const {rerender} = render(<PromptInput onSubmit={vi.fn()} initialValue="surfboards" />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.change(textarea, {target: {value: 'wetsuits'}});
    expect(textarea.value).toBe('wetsuits');

    rerender(<PromptInput onSubmit={vi.fn()} initialValue="surfboards" />);
    expect(textarea.value).toBe('wetsuits');
  });
});
