import styles from './ErrorTurnBlock.module.css';

interface ErrorTurnBlockProps {
  error?: string;
}

export function ErrorTurnBlock({error}: ErrorTurnBlockProps) {
  const message = error || 'An unknown error occurred.';

  return (
    <div className={styles.container} role="alert">
      <span className={styles.message}>{message}</span>
    </div>
  );
}
