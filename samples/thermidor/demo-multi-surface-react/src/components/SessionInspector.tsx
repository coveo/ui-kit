import {useSurfaceLayout, useScheduler, useTurns} from '../session/storefront-session.js';
import styles from './SessionInspector.module.css';

/**
 * Shows the one session at work: its turns, the area each came from, and the surfaces alive in
 * the renderer with the slot the server asked for.
 */
export function SessionInspector() {
  const turns = useTurns();
  const layout = useSurfaceLayout();
  const scheduler = useScheduler();

  return (
    <details className={styles.inspector}>
      <summary>
        One session · {turns.length} turns · {layout.surfaces.length} live surfaces
      </summary>
      <div className={styles.columns}>
        <table>
          <caption>Live surfaces</caption>
          <thead>
            <tr>
              <th>Surface</th>
              <th>Slot</th>
              <th>Root</th>
              <th>Turn</th>
            </tr>
          </thead>
          <tbody>
            {layout.surfaces.map((surface) => (
              <tr key={surface.surfaceId}>
                <td>{surface.surfaceId.slice(0, 11)}…</td>
                <td>{surface.slot ?? '—'}</td>
                <td>{surface.rootComponent ?? '—'}</td>
                <td>{surface.turnIndex + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <caption>Turns</caption>
          <thead>
            <tr>
              <th>#</th>
              <th>Context</th>
              <th>Prompt</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {turns.map((turn, index) => (
              <tr key={turn.id}>
                <td>{index + 1}</td>
                <td>{scheduler.turnContexts.get(turn.id) ?? '—'}</td>
                <td>{turn.input.prompt || '—'}</td>
                <td>{turn.status === 'error' ? turn.error : turn.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
