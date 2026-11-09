import {useContext, useState} from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {PromptInput} from './PromptInput.js';
import {
  ActiveAsideOptionContext,
  ASIDE_LISTBOX_ID,
  type SuggestionSection,
} from '../SuggestionsDropdown/index.js';

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

  it('disables the textarea and the submit button when disabled', () => {
    render(<PromptInput onSubmit={vi.fn()} disabled />);

    expect((screen.getByLabelText('Prompt') as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByLabelText('Submit') as HTMLButtonElement).disabled).toBe(true);
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

  it('leaves the arrow keys to the textarea once its suggestions are gone', () => {
    const {rerender} = render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} />);

    const textarea = screen.getByLabelText('Prompt');
    textarea.focus();
    rerender(<PromptInput onSubmit={vi.fn()} suggestions={[]} />);

    expect(fireEvent.keyDown(textarea, {key: 'ArrowDown', code: 'ArrowDown'})).toBe(true);
    expect(fireEvent.keyDown(textarea, {key: 'ArrowUp', code: 'ArrowUp'})).toBe(true);
  });

  it('opens the dropdown above the input when placed above', () => {
    render(
      <PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} suggestionsPlacement="above" />
    );

    fireEvent.focus(screen.getByLabelText('Prompt'));

    expect(screen.getByRole('listbox').parentElement?.className).toMatch(/above/);
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

  it('never reports an item of new suggestions at the old highlight', () => {
    const onActiveItemChange = vi.fn();
    const nextSuggestions: SuggestionSection[] = [
      {
        id: 'search',
        title: 'Search',
        icon: 'search',
        items: [
          {id: 'n1', label: 'Surf wax'},
          {id: 'n2', label: 'Surf leash'},
        ],
      },
    ];
    const {rerender} = render(
      <PromptInput
        onSubmit={vi.fn()}
        suggestions={testSuggestions}
        onActiveItemChange={onActiveItemChange}
      />
    );
    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    onActiveItemChange.mockClear();

    rerender(
      <PromptInput
        onSubmit={vi.fn()}
        suggestions={nextSuggestions}
        onActiveItemChange={onActiveItemChange}
      />
    );

    expect(onActiveItemChange.mock.calls).toEqual([[undefined]]);
    expect(textarea.getAttribute('aria-activedescendant')).toBeNull();
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
  it('does not show the dropdown when disabled, even with suggestions', () => {
    render(<PromptInput onSubmit={vi.fn()} suggestions={testSuggestions} disabled />);

    fireEvent.focus(screen.getByRole('combobox', {name: 'Prompt'}));

    expect(screen.queryByRole('listbox')).toBeNull();
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

describe('highlighted suggestion', () => {
  function renderWithHighlight(suggestions = testSuggestions) {
    const onActiveItemChange = vi.fn();
    const view = render(
      <PromptInput
        onSubmit={vi.fn()}
        suggestions={suggestions}
        onActiveItemChange={onActiveItemChange}
        suggestionsAside={<aside aria-label="Beside the suggestions" />}
      />
    );
    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);
    const highlighted = () => onActiveItemChange.mock.lastCall?.[0]?.label;
    return {...view, textarea, highlighted, onActiveItemChange};
  }

  it('reports the item the arrow keys move to', () => {
    const {textarea, highlighted} = renderWithHighlight();

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(highlighted()).toBe('Surfboards');

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(highlighted()).toBe('Wetsuits');

    fireEvent.keyDown(textarea, {key: 'ArrowUp'});
    expect(highlighted()).toBe('Surfboards');
  });

  it('reports and highlights the item under the pointer, and keeps it once the pointer leaves', () => {
    const {textarea, highlighted} = renderWithHighlight();

    const wetsuits = screen.getByRole('option', {name: 'Wetsuits'});
    fireEvent.mouseEnter(wetsuits);
    fireEvent.mouseLeave(wetsuits);

    expect(highlighted()).toBe('Wetsuits');
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-s2');
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(highlighted()).toBe('Build a beginner surfing kit');
  });

  it('reports no item once the suggestions change', () => {
    const {textarea, highlighted, rerender, onActiveItemChange} = renderWithHighlight();
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(highlighted()).toBe('Surfboards');

    rerender(
      <PromptInput
        onSubmit={vi.fn()}
        suggestions={[...testSuggestions]}
        onActiveItemChange={onActiveItemChange}
      />
    );
    expect(highlighted()).toBeUndefined();
  });

  it('reports no item once the dropdown closes', () => {
    const {textarea, highlighted} = renderWithHighlight();
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});

    fireEvent.keyDown(textarea, {key: 'Escape'});

    expect(highlighted()).toBeUndefined();
  });

  it('draws what goes beside the suggestions outside their listbox, while they are open', () => {
    const {textarea} = renderWithHighlight();

    const aside = screen.getByRole('complementary', {name: 'Beside the suggestions'});
    expect(screen.getByRole('listbox').contains(aside)).toBe(false);

    fireEvent.keyDown(textarea, {key: 'Escape'});
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});

function TestAside({onSelect}: {onSelect: (id: string) => void}) {
  const activeOptionId = useContext(ActiveAsideOptionContext);
  return (
    <div id={ASIDE_LISTBOX_ID} role="listbox" aria-label="Products">
      {['p1', 'p2'].map((id) => (
        <div
          key={id}
          id={id}
          role="option"
          aria-selected={id === activeOptionId}
          onClick={() => onSelect(id)}
        >
          {id}
        </div>
      ))}
    </div>
  );
}

describe('keyboard navigation, as in Atomic commerce', () => {
  function renderNavigable() {
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    const onActiveItemChange = vi.fn();
    const onSelectProduct = vi.fn();
    render(
      <PromptInput
        onSubmit={onSubmit}
        suggestions={testSuggestions}
        onValueChange={onValueChange}
        onActiveItemChange={onActiveItemChange}
        suggestionsAside={<TestAside onSelect={onSelectProduct} />}
      />
    );
    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.change(textarea, {target: {value: 'surf'}});
    onValueChange.mockClear();
    fireEvent.focus(textarea);
    const press = (key: string) => fireEvent.keyDown(textarea, {key});
    const highlighted = () => onActiveItemChange.mock.lastCall?.[0]?.label;
    const active = () => textarea.getAttribute('aria-activedescendant');
    return {textarea, press, highlighted, active, onSubmit, onValueChange, onSelectProduct};
  }

  it('shows and submits the suggestion the arrow keys highlight, without reporting it as typed', () => {
    const {textarea, press, onSubmit, onValueChange} = renderNavigable();

    press('ArrowDown');
    expect(textarea.value).toBe('Surfboards');
    press('ArrowDown');
    expect(textarea.value).toBe('Wetsuits');
    press('Enter');

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith('Wetsuits');
  });

  it('wraps around the suggestions, and puts the typed text back above the first one', () => {
    const {textarea, press, active} = renderNavigable();

    press('ArrowDown');
    press('ArrowUp');
    expect(textarea.value).toBe('surf');
    expect(active()).toBeNull();

    press('ArrowUp');
    expect(textarea.value).toBe('Build a beginner surfing kit');
    press('ArrowDown');
    expect(textarea.value).toBe('Surfboards');
  });

  it('leaves the input as typed on hover, and Enter then submits what was typed', () => {
    const {textarea, press, highlighted, onSubmit} = renderNavigable();

    fireEvent.mouseEnter(screen.getByRole('option', {name: 'Wetsuits'}));
    expect(highlighted()).toBe('Wetsuits');
    expect(textarea.value).toBe('surf');

    press('Enter');
    expect(onSubmit).toHaveBeenCalledWith('surf');
  });

  it('keeps the shown suggestion on Escape, and makes it the query once the input is focused again', () => {
    const {textarea, press, onValueChange} = renderNavigable();
    press('ArrowDown');

    press('Escape');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(textarea.value).toBe('Surfboards');
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.focus(textarea);
    expect(onValueChange).toHaveBeenCalledWith('Surfboards');
  });

  it('keeps the search box as it was when the window gets the focus back', () => {
    const {textarea, press, active, onValueChange} = renderNavigable();
    textarea.focus();
    press('ArrowDown');
    press('ArrowRight');
    press('Enter');

    fireEvent.blur(textarea);
    fireEvent.focus(textarea);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(textarea.value).toBe('Surfboards');
    expect(active()).toBe('p1');
  });

  it('makes the shown suggestion the query once the shopper focuses the input again', () => {
    const {textarea, press, onValueChange} = renderNavigable();
    textarea.focus();
    press('ArrowDown');

    textarea.blur();
    fireEvent.focus(textarea);

    expect(onValueChange).toHaveBeenCalledWith('Surfboards');
  });

  it('scrolls the option the arrow keys highlight into view', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const {press} = renderNavigable();

    press('ArrowUp');
    press('ArrowRight');

    expect(scrollIntoView.mock.contexts.map((option) => (option as Element).id)).toEqual([
      'suggestion-item-c1',
      'p1',
    ]);
    expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
    scrollIntoView.mockRestore();
  });

  it('leaves the left and right arrows to the caret without a highlight', () => {
    const {press} = renderNavigable();

    expect(press('ArrowRight')).toBe(true);
    expect(press('ArrowLeft')).toBe(true);
  });

  it('moves through the products and back, keeping the suggestion they are for', () => {
    const {textarea, press, highlighted, active} = renderNavigable();
    press('ArrowDown');
    press('ArrowDown');

    expect(press('ArrowRight')).toBe(false);
    expect(active()).toBe('p1');
    expect(screen.getByRole('option', {name: 'p1'}).getAttribute('aria-selected')).toBe('true');
    expect(highlighted()).toBe('Wetsuits');
    expect(textarea.value).toBe('Wetsuits');
    expect(textarea.getAttribute('aria-controls')).toBe(ASIDE_LISTBOX_ID);

    press('ArrowDown');
    expect(active()).toBe('p2');
    press('ArrowDown');
    expect(active()).toBe('p1');
    press('ArrowUp');
    expect(active()).toBe('p2');

    expect(press('ArrowLeft')).toBe(false);
    expect(active()).toBe('suggestion-item-s2');
    expect(highlighted()).toBe('Wetsuits');

    press('ArrowRight');
    expect(active()).toBe('p2');
  });

  it('leaves the products once the shopper types, so Enter submits the typed text', () => {
    const {textarea, press, active, onSubmit, onSelectProduct} = renderNavigable();
    press('ArrowDown');
    press('ArrowRight');

    fireEvent.change(textarea, {target: {value: 'Surfboards x'}});
    expect(active()).toBe('suggestion-item-s1');
    press('Enter');

    expect(onSelectProduct).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith('Surfboards x');
  });

  it('opens the highlighted product on Enter, and closes the dropdown', () => {
    const {press, onSubmit, onSelectProduct} = renderNavigable();
    press('ArrowDown');
    press('ArrowRight');

    press('Enter');

    expect(onSelectProduct).toHaveBeenCalledWith('p1');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('removing a suggestion', () => {
  function RemovableSuggestions({onRemove}: {onRemove: (label: string) => void}) {
    const [labels, setLabels] = useState(['tents', 'hiking boots', 'kayaks']);
    const sections: SuggestionSection[] = [
      {
        id: 'recent',
        title: 'Recent searches',
        icon: 'history',
        items: labels.map((label, index) => ({id: `recent-${index}`, label})),
        removal: {
          ariaLabel: ({label}) => `Remove ${label}`,
          onRemove: ({label}) => {
            onRemove(label);
            setLabels((current) => current.filter((other) => other !== label));
          },
        },
      },
      {id: 'search', title: 'Search', icon: 'search', items: [{id: 's1', label: 'surfboards'}]},
    ];
    return <PromptInput onSubmit={vi.fn()} suggestions={sections} />;
  }

  function renderRemovable() {
    const onRemove = vi.fn();
    render(<RemovableSuggestions onRemove={onRemove} />);
    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.change(textarea, {target: {value: 't'}});
    fireEvent.focus(textarea);
    const press = (key: string, shiftKey = false) => fireEvent.keyDown(textarea, {key, shiftKey});
    const active = () =>
      document.getElementById(textarea.getAttribute('aria-activedescendant') ?? '')?.textContent;
    return {textarea, press, active, onRemove};
  }

  it.each(['Delete', 'Backspace'])(
    'removes the highlighted suggestion on Shift+%s, and highlights the one after it',
    (key) => {
      const {textarea, press, active, onRemove} = renderRemovable();
      press('ArrowDown');
      press('ArrowDown');

      press(key, true);

      expect(onRemove).toHaveBeenCalledWith('hiking boots');
      expect(active()).toBe('kayaks');
      expect(textarea.value).toBe('kayaks');

      press('Delete', true);
      expect(active()).toBe('surfboards');
      expect(textarea.value).toBe('surfboards');
    }
  );

  it('keeps the highlight on a removal with a button, and the input on the highlighted one', () => {
    const {textarea, press, active, onRemove} = renderRemovable();
    fireEvent.mouseEnter(screen.getByRole('option', {name: /kayaks/}));
    fireEvent.click(screen.getByRole('button', {name: 'Remove kayaks'}));
    expect(onRemove).toHaveBeenCalledWith('kayaks');
    expect(active()).toBe('surfboards');
    expect(textarea.value).toBe('t');

    press('ArrowUp');
    press('ArrowUp');
    fireEvent.click(screen.getByRole('button', {name: 'Remove tents'}));
    expect(active()).toBe('hiking boots');
    expect(textarea.value).toBe('hiking boots');

    fireEvent.click(screen.getByRole('button', {name: 'Remove hiking boots'}));
    expect(active()).toBe('surfboards');
    expect(textarea.value).toBe('surfboards');
  });

  it('leaves Delete without Shift, and suggestions that cannot be removed, to the textarea', () => {
    const {press, active, onRemove} = renderRemovable();
    press('ArrowDown');

    expect(press('Delete')).toBe(true);
    press('ArrowUp');
    press('ArrowUp');
    expect(active()).toBe('surfboards');
    expect(press('Delete', true)).toBe(true);
    expect(onRemove).not.toHaveBeenCalled();
  });
});

describe('focus', () => {
  it('reports when the input gains or loses the focus, but not when only the window does', () => {
    const onFocusChange = vi.fn();
    render(<PromptInput onSubmit={vi.fn()} onFocusChange={onFocusChange} />);
    const textarea = screen.getByLabelText('Prompt');

    act(() => textarea.focus());
    expect(onFocusChange).toHaveBeenLastCalledWith(true);
    fireEvent.blur(textarea);
    expect(onFocusChange).toHaveBeenLastCalledWith(true);
    act(() => textarea.blur());
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
  });

  it('opens on suggestions arriving after the input got the focus back right after losing it', () => {
    vi.useFakeTimers();
    try {
      const section: SuggestionSection = {
        id: 'recent',
        title: 'Recent searches',
        icon: 'history',
        items: [{id: 'r1', label: 'tents'}],
      };
      const {rerender} = render(<PromptInput onSubmit={vi.fn()} suggestions={[]} />);
      const textarea = screen.getByLabelText('Prompt');
      act(() => textarea.focus());
      act(() => textarea.blur());
      act(() => textarea.focus());

      rerender(<PromptInput onSubmit={vi.fn()} suggestions={[section]} />);
      act(() => vi.advanceTimersByTime(200));

      expect(screen.queryAllByRole('option')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
