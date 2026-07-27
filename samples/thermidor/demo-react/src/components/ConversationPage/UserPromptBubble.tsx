import styles from './UserPromptBubble.module.css';

interface UserPromptBubbleProps {
  prompt: string;
}

export function UserPromptBubble({prompt}: UserPromptBubbleProps) {
  return <div className={styles.bubble}>{prompt}</div>;
}
