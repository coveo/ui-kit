import styles from './UserPrompt.module.css';

interface UserPromptProps {
  text: string;
}

export function UserPrompt({text}: UserPromptProps) {
  return <div className={styles.bubble}>{text}</div>;
}
