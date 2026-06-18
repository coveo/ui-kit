import styles from './NextActionsBar.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UINextActionsBarProps {
  surface: ParsedSurface;
  onAction?: (text: string, type: string) => void;
}

interface ActionItem {
  text?: string;
  type?: string;
}

export function A2UINextActionsBar({
  surface,
  onAction,
}: A2UINextActionsBarProps) {
  const items = (surface.data.actions as ActionItem[]) ?? [];

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
