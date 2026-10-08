import {useState} from 'react';
import {SLOTS, surfacesInSlot} from '../layout/surface-layout.js';
import {Slot} from '../layout/Slot.js';
import {useScheduler, useSurfaceLayout, useTurns} from '../session/storefront-session.js';
import {SHELL_CONTEXT} from '../session/turn-scheduler.js';
import {useDebouncedCallback} from './use-debounced-callback.js';
import styles from './TopBar.module.css';

export const SEARCH_DEBOUNCE_MS = 300;

interface SearchBoxProps {
  /** Opens the assistant page for a committed search. */
  onCommit(prompt: string): void;
  /** Whether the suggestions popover may show; the page closes it after a selection. */
  open: boolean;
  onOpenChange(open: boolean): void;
}

/**
 * Search-as-you-type in the header. Each pause of 300 ms sends the query as a shell turn; the
 * server answers on the `header.suggestions` surface, drawn in the popover below the input.
 */
export function SearchBox({onCommit, open, onOpenChange}: SearchBoxProps) {
  const scheduler = useScheduler();
  const layout = useSurfaceLayout();
  const turns = useTurns();
  const [value, setValue] = useState('');
  const suggestions = surfacesInSlot(layout, SLOTS.headerSuggestions);
  const searching = turns.some(
    (turn) => turn.status === 'streaming' && scheduler.turnContexts.get(turn.id) === SHELL_CONTEXT
  );

  const search = useDebouncedCallback((prompt: string) => {
    scheduler.searchAsYouType(prompt);
  }, SEARCH_DEBOUNCE_MS);

  const onChange = (next: string) => {
    setValue(next);
    const prompt = next.trim();
    if (prompt) {
      onOpenChange(true);
      search(prompt);
    } else {
      search.cancel();
      scheduler.cancelSearch();
      onOpenChange(false);
    }
  };

  const commit = () => {
    const prompt = value.trim();
    if (!prompt) {
      return;
    }
    search.cancel();
    scheduler.cancelSearch();
    onCommit(prompt);
    setValue('');
  };

  const showPopover = open && value.trim() !== '' && suggestions.length > 0;

  return (
    <div className={styles.search}>
      <input
        className={styles.input}
        type="search"
        value={value}
        placeholder="Search products or ask a question"
        aria-label="Search"
        aria-expanded={showPopover}
        onChange={(event) => onChange(event.currentTarget.value)}
        onFocus={() => onOpenChange(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commit();
          } else if (event.key === 'Escape') {
            onOpenChange(false);
          }
        }}
      />
      {searching && <span className={styles.spinner} aria-label="Searching" />}
      {showPopover && (
        <div className={styles.popover}>
          <Slot name={SLOTS.headerSuggestions} surfaces={suggestions} />
        </div>
      )}
    </div>
  );
}
