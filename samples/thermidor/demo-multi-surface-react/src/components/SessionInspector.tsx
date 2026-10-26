import {useScheduler, useSessionSnapshot} from '../session/storefront-session.js';
import styles from './SessionInspector.module.css';

/**
 * Shows the one session at work: each turn, the view that sent it (`context.custom.surfaceId`),
 * and the surfaces it created that are still alive.
 */
export function SessionInspector() {
  const {turns, surfaces} = useSessionSnapshot();
  const scheduler = useScheduler();

  return (
    <details className={styles.inspector}>
      <summary>
        One session · {turns.length} turns · {surfaces.length} live surfaces
      </summary>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>View (custom.surfaceId)</th>
            <th>Prompt</th>
            <th>Status</th>
            <th>Live surfaces</th>
          </tr>
        </thead>
        <tbody>
          {turns.map((turn, index) => (
            <tr key={turn.id}>
              <td>{index + 1}</td>
              <td>{scheduler.turnContexts.get(turn.id) ?? '—'}</td>
              <td>{turn.input.prompt || '—'}</td>
              <td>{turn.status === 'error' ? turn.error : turn.status}</td>
              <td>
                {turn.response.surfaces.map(({surfaceId}) => surfaceId.slice(0, 11)).join(', ') ||
                  '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
