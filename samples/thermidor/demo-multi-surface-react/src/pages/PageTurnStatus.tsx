import type {Turn} from '@coveo/thermidor';
import styles from './pages.module.css';

interface PageTurnStatusProps {
  turn: Turn | undefined;
  /** Whether the page's turn is the session's latest one. */
  isLatestTurn: boolean;
}

/** The page turn's error, and a note once a newer turn has made the page read-only. */
export function PageTurnStatus({turn, isLatestTurn}: PageTurnStatusProps) {
  if (!turn) {
    return null;
  }
  if (turn.status === 'error') {
    return <p className={styles.error}>This answer stopped early: {turn.error}</p>;
  }
  if (!isLatestTurn) {
    return (
      <p className={styles.note}>
        A newer turn started (the header's suggestions), so these surfaces no longer send actions to
        the server. App-side controls, such as Add to cart, still work.
      </p>
    );
  }
  return null;
}
