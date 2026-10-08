import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {ActionItem, NextActionsBarAction} from '@coveo/thermidor-schema';
import {NextActionsBarPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';
import styles from './NextActionsBar.module.css';

/**
 * A2-UI component for the `next-actions-bar`. The generic binder resolves `suggestedActions` from
 * `NextActionsBarPropsSchema`; selecting one dispatches through `context.dispatchAction`:
 *
 * - a `followup` or `search` item dispatches `selectAction {text, type}`;
 * - a `searchOption` item dispatches `selectSearchOption {optionId}`. The gateway keeps the search
 *   saved under `optionId` and opens it as a new commerce-search surface.
 */
export const NextActionsBar = createReactComponent(
  {
    name: 'NextActionsBar',
    schema: NextActionsBarPropsSchema,
  },
  ({props, context}) => {
    const dispatch = (action: NextActionsBarAction) => {
      context.dispatchAction(action);
    };
    // No local state to assert, so the optimistic value is just "this bar's dispatch is in flight".
    const {value: selecting, dispatchOptimistic} = useOptimisticValue(false, dispatch);
    const actions = props.suggestedActions ?? [];

    if (actions.length === 0) {
      return null;
    }

    const handleSelectAction = (action: ActionItem) => {
      const nextActionsBarAction: NextActionsBarAction =
        action.type === 'searchOption'
          ? {event: {name: 'selectSearchOption', context: {optionId: action.optionId}}}
          : {event: {name: 'selectAction', context: {text: action.text, type: action.type}}};
      dispatchOptimistic({action: nextActionsBarAction, next: true});
    };

    return (
      <div className={styles.container} role="group" aria-label="Follow-up actions">
        {actions.map((action: ActionItem, i: number) => (
          <button
            key={i}
            className={styles.actionButton}
            onClick={() => handleSelectAction(action)}
            disabled={selecting}
            aria-busy={selecting}
            type="button"
          >
            {action.text}
          </button>
        ))}
      </div>
    );
  }
);
