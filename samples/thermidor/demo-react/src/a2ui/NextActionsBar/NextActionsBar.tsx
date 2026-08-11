import styles from './NextActionsBar.module.css';
import type {ParsedSurface} from '../types.js';

interface A2UINextActionsBarProps {
  surface: ParsedSurface;
  onAction?: (text: string, type: string) => void;
}

interface ActionItem {
  text: string;
  type: string;
}

interface NextActionsData {
  actions?: {
    items?: ActionItem[];
  };
}

export function A2UINextActionsBar({surface, onAction}: A2UINextActionsBarProps) {
  const data = surface.data as NextActionsData;
  const items = data.actions?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} role="group" aria-label="Follow-up actions">
      {items.map((action, i) => (
        <button
          key={i}
          className={styles.actionButton}
          onClick={() => onAction?.(action.text, action.type)}
          type="button"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
