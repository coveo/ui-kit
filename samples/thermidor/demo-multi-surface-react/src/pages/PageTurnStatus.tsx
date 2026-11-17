import type {Turn} from '@coveo/thermidor';
import styles from './pages.module.css';

/** The page turn's error, when it stopped early. */
export function PageTurnStatus({turn}: {turn: Turn | undefined}) {
  if (turn?.status !== 'error') {
    return null;
  }
  return <p className={styles.error}>This answer stopped early: {turn.error}</p>;
}
