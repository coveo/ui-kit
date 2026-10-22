import {useState, type FormEvent} from 'react';
import styles from './SearchPanel.module.css';

interface SearchBoxProps {
  /** Sends the text as a prompt, exactly as the chat input does. */
  onSubmit: (prompt: string) => void;
  /** Whether a turn is running; the gateway refuses a second one with a 409. */
  isStreaming: boolean;
}

/**
 * PROTOTYPE (COMSHOPX-1470): the results panel's search box. It is application UI, not part of
 * any surface (thermidor-schema ADR-020), and shares the chat's intent routing: a prompt routed to
 * a search updates the results panel, and one routed to the agent is answered in the chat.
 *
 * The text stays after a search, as a storefront search box keeps the query.
 */
export function SearchBox({onSubmit, isStreaming}: SearchBoxProps) {
  const [text, setText] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || isStreaming) return;
    onSubmit(text.trim());
  };

  return (
    <form className={styles.searchBox} role="search" onSubmit={handleSubmit}>
      <SearchIcon />
      <input
        className={styles.searchInput}
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search products, or ask a question"
        aria-label="Search products"
      />
      <button
        className={styles.searchButton}
        type="submit"
        disabled={isStreaming || !text.trim()}
        title={isStreaming ? 'Waiting for the assistant to finish' : undefined}
      >
        {isStreaming ? 'Assistant is answering…' : 'Search'}
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m10.5 10.5 3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
