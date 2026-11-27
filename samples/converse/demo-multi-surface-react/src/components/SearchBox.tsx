import {useState} from 'react';
import styles from './TopBar.module.css';

interface SearchBoxProps {
  /** Commits a prompt. The server decides whether it is a search or a question for the agent. */
  onCommit(query: string): void;
  /** While a request is in flight: another search would race the turn the server is running. */
  disabled: boolean;
}

/** The header's search box. Nothing is sent while typing: a search opens a page when committed. */
export function SearchBox({onCommit, disabled}: SearchBoxProps) {
  const [value, setValue] = useState('');

  const commit = () => {
    const query = value.trim();
    if (!query || disabled) {
      return;
    }
    onCommit(query);
    setValue('');
  };

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
        placeholder="Search or ask"
        aria-label="Search"
        disabled={disabled}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
    </form>
  );
}
