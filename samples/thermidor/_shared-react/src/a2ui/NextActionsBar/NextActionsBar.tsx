import styles from './NextActionsBar.module.css';

interface ActionItem {
  text?: string;
  type?: string;
}

interface A2UINextActionsBarProps {
  items: ActionItem[];
  onAction?: (text: string, type: string) => void;
}

export function A2UINextActionsBar({items, onAction}: A2UINextActionsBarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {items.map((action, i) => (
        <button
          key={i}
          className={styles.actionButton}
          onClick={() =>
            onAction?.(action.text ?? '', action.type ?? 'followup')
          }
          type="button"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
