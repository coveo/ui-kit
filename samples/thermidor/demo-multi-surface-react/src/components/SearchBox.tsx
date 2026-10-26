import {useState} from 'react';
import styles from './TopBar.module.css';

interface SearchBoxProps {
  /** Commits a search: the assistant page with the AI toggle on, the search page without. */
  onCommit(query: string, ai: boolean): void;
}

/** The header's search box. Nothing is sent while typing: a search opens a page when committed. */
export function SearchBox({onCommit}: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [ai, setAi] = useState(true);

  const commit = () => {
    const query = value.trim();
    if (!query) {
      return;
    }
    onCommit(query, ai);
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
        placeholder={ai ? 'Ask the shopping assistant' : 'Search for products'}
        aria-label="Search"
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <label className={ai ? `${styles.aiToggle} ${styles.aiToggleOn}` : styles.aiToggle}>
        <input type="checkbox" checked={ai} onChange={(event) => setAi(event.target.checked)} />
        AI
      </label>
    </form>
  );
}
