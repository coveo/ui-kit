import {createContext, useContext} from 'react';
import {createComponentImplementation} from '@a2ui/react';
import type {ProgressBlockStatus, ProgressBlockStep} from '@coveo/thermidor-schema';
import {ProgressBlockPropsSchema} from '@coveo/thermidor-schema/zod3';
import styles from './ProgressBlock.module.css';

/**
 * Whether the turn the block belongs to failed. The gateway can end a turn with `RUN_ERROR` while
 * the block is still `running` (ADR-028), and only the turn's status says so.
 */
export const TurnFailedContext = createContext(false);

type RowState = ProgressBlockStep['status'] | 'failed';

// What a screen reader hears for each row's icon.
const ROW_STATE_TEXT: Record<RowState, string> = {
  active: 'in progress',
  done: 'done',
  failed: 'failed',
};

function rowState(step: ProgressBlockStep, blockFailed: boolean): RowState {
  return blockFailed && step.status === 'active' ? 'failed' : step.status;
}

/**
 * A2-UI component for `ProgressBlock` (ADR-028): the agent's progress for one turn, as a list that
 * grows. A done step gets a tick and an active one a spinner, and several can be active at once.
 * The backend picks the steps and sends each label ready to show, so a step renders by its label
 * and never by its id: an id this app doesn't know renders like any other. A block that ended in
 * `error`, or was still `running` when its turn failed, marks its active steps failed.
 */
export const ProgressBlock = createComponentImplementation(
  {
    name: 'ProgressBlock',
    schema: ProgressBlockPropsSchema,
  },
  ({props}) => {
    const turnFailed = useContext(TurnFailedContext);
    const steps: ProgressBlockStep[] = Array.isArray(props.steps) ? props.steps : [];
    const status: ProgressBlockStatus = typeof props.status === 'string' ? props.status : 'running';
    const blockFailed = status === 'error' || (turnFailed && status === 'running');

    if (steps.length === 0) {
      return null;
    }

    return (
      <ol
        className={styles.list}
        aria-label="Agent progress"
        aria-live="polite"
        data-status={blockFailed ? 'error' : status}
      >
        {steps.map((step) => {
          const state = rowState(step, blockFailed);
          return (
            <li key={step.id} className={styles.step} data-state={state}>
              <StepIcon state={state} />
              <span className={styles.label}>{step.label}</span>
              <span className={styles.visuallyHidden}> ({ROW_STATE_TEXT[state]})</span>
            </li>
          );
        })}
      </ol>
    );
  }
);

function StepIcon({state}: {state: RowState}) {
  if (state === 'done') {
    return (
      <svg className={`${styles.icon} ${styles.tick}`} viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3 8.5l3.2 3L13 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (state === 'failed') {
    return (
      <svg className={`${styles.icon} ${styles.cross}`} viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M4.5 4.5l7 7M11.5 4.5l-7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return <span className={`${styles.icon} ${styles.spinner}`} aria-hidden="true" />;
}
