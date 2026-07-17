import {buildResultListController} from '@coveo/thermidor';
import {searchInterface} from '../../search-setup.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import styles from './ResultList.module.css';

export function ResultList() {
  const [_, state] = useBuildController(() =>
    buildResultListController({interface: searchInterface})
  );

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
