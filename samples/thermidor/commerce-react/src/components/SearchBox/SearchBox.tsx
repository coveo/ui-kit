import {useState, type FormEvent} from 'react';
import {buildSearchBoxController} from '@coveo/thermidor';
import {useCommerceInterface} from '../../context/commerce-interface.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import styles from './SearchBox.module.css';

export function SearchBox() {
  const commerceInterface = useCommerceInterface();

  const [controller, state] = useBuildController(() =>
    buildSearchBoxController({interface: commerceInterface})
  );

  const [inputValue, setInputValue] = useState(state.query);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        placeholder="Search products..."
        aria-label="Search products"
      />
      <button type="submit" className={styles.button} disabled={state.isLoading}>
        {state.isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
