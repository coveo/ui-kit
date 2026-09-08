import {useState, useEffect} from 'react';
import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {SearchBoxProps} from '@coveo/thermidor-schema';
import styles from './SearchBox.module.css';

export function SearchBoxRenderer({props}: {props: SearchBoxProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (controller.state) {
      setInputValue(controller.state.query);
    }
  }, [controller.state?.query]);

  if (!controller.state) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    controller.dispatch('submitQuery', {query: inputValue});
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit} role="search">
      <input
        id={`search-box-input-${props.componentId}`}
        className={styles.input}
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
        aria-label="Search"
      />
      <button className={styles.submitButton} type="submit" aria-label="Submit search">
        Search
      </button>
    </form>
  );
}
