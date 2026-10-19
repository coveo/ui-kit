import {useState} from 'react';
import {useScheduler, useTurns, useViewSurfaces} from '../session/storefront-session.js';
import {SHELL_CONTEXT} from '../session/turn-scheduler.js';
import {SurfaceList} from '../views/SurfaceList.js';
import {useDebouncedCallback} from './use-debounced-callback.js';
import styles from './TopBar.module.css';

const SEARCH_DEBOUNCE_MS = 300;

interface SearchBoxProps {
  /** Commits a search: the assistant page with the AI toggle on, the search page without. */
  onCommit(query: string, ai: boolean): void;
  /** Whether the suggestions popover may show; the app closes it after a pick. */
  open: boolean;
  onOpenChange(open: boolean): void;
}

/**
 * Search-as-you-type in the header. Each pause of 300 ms sends the query as a prompt on the
 * `storefront-preview` view; the popover draws the suggestions surface of the latest such turn.
 */
export function SearchBox({onCommit, open, onOpenChange}: SearchBoxProps) {
  const scheduler = useScheduler();
  const {suggestions, stream} = useViewSurfaces();
  const turns = useTurns();
  const [value, setValue] = useState('');
  const [ai, setAi] = useState(true);
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
    const query = value.trim();
    if (!query) {
      return;
    }
    search.cancel();
    scheduler.cancelSearch();
    onCommit(query, ai);
    setValue('');
  };

  const showPopover = open && value.trim() !== '' && suggestions.length > 0;

  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
    >
      <input
        className={styles.input}
        type="search"
        value={value}
        placeholder={ai ? 'Ask the shopping assistant' : 'Search for products'}
        aria-label="Search"
        aria-expanded={showPopover}
        onChange={(event) => onChange(event.currentTarget.value)}
        onFocus={() => onOpenChange(true)}
        onBlur={() => onOpenChange(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onOpenChange(false);
          }
        }}
      />
      {searching && <span className={styles.spinner} aria-label="Searching" />}
      <label className={ai ? `${styles.aiToggle} ${styles.aiToggleOn}` : styles.aiToggle}>
        <input type="checkbox" checked={ai} onChange={(event) => setAi(event.target.checked)} />
        AI
      </label>
      {showPopover && (
        <div className={styles.popover}>
          <SurfaceList
            surfaceIds={suggestions}
            loadingSurfaces={stream.loadingSurfaces}
            isStreaming={searching}
          />
        </div>
      )}
    </form>
  );
}
