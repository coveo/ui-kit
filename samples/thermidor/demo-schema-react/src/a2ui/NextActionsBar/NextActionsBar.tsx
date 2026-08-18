import type {ActionItem} from '@coveo/thermidor-schema';
import {useAdvertisedController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import {NEXT_ACTIONS_SCHEMA_ID} from '../components.js';
import styles from './NextActionsBar.module.css';

interface NextActionsBarProps {
  controllers: {
    nextActionsController: {
      controllerId: string;
      controllerSchema: typeof NEXT_ACTIONS_SCHEMA_ID;
    };
  };
}

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
          onClick={() => controller.dispatch('selectAction', {text: action.text, type: action.type})}
          type="button"
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
