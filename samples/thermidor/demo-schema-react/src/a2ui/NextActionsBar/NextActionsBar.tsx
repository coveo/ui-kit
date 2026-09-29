import type {ActionItem, NextActionsBarProps, NextActionsBarAction} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './NextActionsBar.module.css';

export function NextActionsBarRenderer({
  props,
  dispatch,
}: TypedRendererProps<NextActionsBarProps, NextActionsBarAction>) {
  const actions = props.suggestedActions ?? [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} role="group" aria-label="Follow-up actions">
      {actions.map((action: ActionItem, i: number) => (
        <button
          key={i}
          className={styles.actionButton}
          onClick={() =>
            dispatch?.({
              event: {name: 'selectAction', context: {text: action.text, type: action.type}},
            })
          }
          type="button"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
