import {createComponentImplementation} from '@a2ui/react';
import type {ActionItem, NextActionsBarAction} from '@coveo/thermidor-schema';
import {NextActionsBarPropsSchema} from '@coveo/thermidor-schema/zod3';
import styles from './NextActionsBar.module.css';

/**
 * A2-UI component for the `next-actions-bar`. The generic binder resolves `suggestedActions` from
 * `NextActionsBarPropsSchema`; selecting one dispatches through `context.dispatchAction`:
 *
 * - a `followup` or `search` item dispatches `selectAction {text, type}`;
 * - a `searchOption` item dispatches `selectSearchOption {optionId, text}`. The gateway keeps the
 *   search saved under `optionId` and opens it as a new commerce-search surface; the text is what
 *   the shopper selected.
 */
export const NextActionsBar = createComponentImplementation(
  {
    name: 'NextActionsBar',
    schema: NextActionsBarPropsSchema,
  },
  // TODO(a2ui-react context): `context` is deprecated in @a2ui/react 0.16. Dispatch with
  // `useA2uiSurface()?.dispatchAction(action, componentId)` once a component can read its own id.
  ({props, context}) => {
    const actions = props.suggestedActions ?? [];

    if (actions.length === 0) {
      return null;
    }

    const handleSelectAction = (action: ActionItem) => {
      const nextActionsBarAction: NextActionsBarAction =
        action.type === 'searchOption'
          ? {
              event: {
                name: 'selectSearchOption',
                context: {optionId: action.optionId, text: action.text},
              },
            }
          : {event: {name: 'selectAction', context: {text: action.text, type: action.type}}};
      context.dispatchAction(nextActionsBarAction);
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
