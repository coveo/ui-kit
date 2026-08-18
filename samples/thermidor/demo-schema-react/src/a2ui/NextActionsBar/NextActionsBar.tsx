import {useAdvertisedController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {ActionItem, NextActionsBarProps} from '@coveo/thermidor-schema';
import styles from './NextActionsBar.module.css';

export function NextActionsBarRenderer({props}: {props: NextActionsBarProps}) {
  const stateSource = useStateSource();
  const controller = useAdvertisedController(stateSource, props.controllers.nextActionsController);
  const actions = controller.state?.actions ?? [];

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
            controller.dispatch('selectAction', {text: action.text, type: action.type})
          }
          type="button"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
