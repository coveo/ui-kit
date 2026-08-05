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

export function A2UINextActionsBar({surface, onAction}: A2UINextActionsBarProps) {
  const items = extractActions(surface);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} role="group" aria-label="Follow-up actions">
      {items.map((action, i) => (
        <button
          key={i}
          className={styles.actionButton}
          onClick={() => onAction?.(action.text!, action.type ?? 'followup')}
          type="button"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}

/**
 * Extract action items from surface data.
 * Unified endpoint format: dataModel.actions.items
 * Legacy format: data.actions (flat array)
 */
function extractActions(surface: ParsedSurface): ActionItem[] {
  const actions = surface.data.actions as {items?: ActionItem[]} | ActionItem[] | undefined;
  if (actions && 'items' in actions && Array.isArray(actions.items)) {
    return actions.items.filter((a) => a.text?.trim());
  }
  if (Array.isArray(actions)) {
    return actions.filter((a) => a.text?.trim());
  }
  return [];
}
