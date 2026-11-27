import type {PropsWithChildren} from 'react';
import styles from './InProgress.module.css';

/**
 * Marks a view of the preview that is designed but has no id in the published contract yet, so
 * it sends no request.
 */
export function InProgress({title, children}: PropsWithChildren<{title: string}>) {
  return (
    <div className={styles.inProgress} role="status">
      <span className={styles.badge}>In progress</span>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.detail}>{children}</p>}
    </div>
  );
}
