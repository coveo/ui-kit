import {useState, type SubmitEvent} from 'react';
import {searchBoxController} from '../../search-setup.js';
import {useController} from '../../hooks/use-controller.js';
import styles from './SearchBox.module.css';

export function SearchBox() {
  const state = useController(searchBoxController);
  const [inputValue, setInputValue] = useState(state.query);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    searchBoxController.setQuery({query: inputValue});
    searchBoxController.submit();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="search"
        className={styles.input}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
        aria-label="Search"
      />
      <button
        type="submit"
        className={styles.button}
        disabled={state.isLoading}
      >
        {state.isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
