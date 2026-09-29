import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {ActionItem, NextActionsBarAction, NextActionsBarProps} from '@coveo/thermidor-schema';
import {NextActionsBarPropsSchema} from '@coveo/thermidor-schema/zod3';
import {toInferableBinderSchema} from '../inferable-binder-schema.js';
import styles from './NextActionsBar.module.css';

/**
 * A2-UI component for the `next-actions-bar`. The generic binder resolves `suggestedActions` from
 * `NextActionsBarPropsSchema`; selecting one dispatches a `selectAction` through
 * `context.dispatchAction`.
 */
export const NextActionsBar = createReactComponent(
  {
    name: 'NextActionsBar',
    schema: toInferableBinderSchema<NextActionsBarProps>(NextActionsBarPropsSchema),
  },
  ({props, context}) => {
    const actions = props.suggestedActions ?? [];

    if (actions.length === 0) {
      return null;
    }

    const handleSelectAction = (action: ActionItem) => {
      const selectActionAction: NextActionsBarAction = {
        event: {name: 'selectAction', context: {text: action.text, type: action.type}},
      };
      context.dispatchAction(selectActionAction);
    };

    return (
      <div className={styles.container} role="group" aria-label="Follow-up actions">
        {actions.map((action: ActionItem, i: number) => (
          <button
            key={i}
            className={styles.actionButton}
            onClick={() => handleSelectAction(action)}
            type="button"
          >
            {action.text}
          </button>
        ))}
      </div>
    );
  }
);
