import {resultListController} from '../../search-setup.js';
import {useController} from '../../hooks/use-controller.js';
import styles from './ResultList.module.css';

export function ResultList() {
  const state = useController(resultListController);

  if (state.results.length === 0) {
    return <p className={styles.empty}>No results to display.</p>;
  }

  return (
    <ul className={styles.list}>
      {state.results.map((result) => (
        <li key={result.uniqueId} className={styles.item}>
          <h3 className={styles.title}>
            <a
              href={result.clickUri}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.title}
            </a>
          </h3>
          {result.excerpt && <p className={styles.excerpt}>{result.excerpt}</p>}
        </li>
      ))}
    </ul>
  );
}
