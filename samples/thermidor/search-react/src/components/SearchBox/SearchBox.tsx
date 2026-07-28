import {useState, type SubmitEvent} from 'react';
import {buildSearchBoxController} from '@coveo/thermidor';
import {useSearchInterface} from '../../context/search-interface.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import styles from './SearchBox.module.css';

export function SearchBox() {
  const searchInterface = useSearchInterface();

  const [controller, state] = useBuildController(() =>
    buildSearchBoxController({interface: searchInterface})
  );

  const [inputValue, setInputValue] = useState(state.query);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    controller.setQuery({query: inputValue});
    controller.submit();
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
      <button type="submit" className={styles.button} disabled={state.isLoading}>
        {state.isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
