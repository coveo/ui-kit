import {useRef} from 'react';
import type {AddedMessage, Turn} from '@coveo/thermidor';
import {activityOf, visibleStepCount} from './activity.js';
import styles from './ActivityRail.module.css';

const ADDED_LABELS: Record<AddedMessage['status'], string> = {
  sending: 'Adding…',
  waiting: 'Adding…',
  applied: 'Added',
  askedNext: 'Asked next',
  notAdded: 'Not added',
};

interface ActivityRailProps {
  turn: Turn;
  /** Whether this is the answer the shopper is on: once stopped, its activity stays open. */
  isLatest: boolean;
  /** Picks a stopped answer back up; offered on the latest one. */
  onContinue?: () => void;
}

/**
 * PROTOTYPE (HACK-408): the answer's progress as the tool calls it makes, with the messages the
 * shopper added placed at the step where the agent took them. A stopped answer
 * says how far it got, and that the work is kept for Continue.
 */
export function ActivityRail({turn, isLatest, onContinue}: ActivityRailProps) {
  const steps = turn.response.agent?.reasoningSteps ?? [];
  const added = turn.addedMessages ?? [];
  const count = visibleStepCount(steps);

  // Where each added message was taken: the steps shown when its "applied" first arrived.
  const takenAfter = useRef(new Map<string, number>()).current;
  for (const message of added) {
    if (message.status === 'applied' && !takenAfter.has(message.id)) {
      takenAfter.set(message.id, count);
    }
  }

  const entries = activityOf(steps, added, takenAfter);
  const streaming = turn.status === 'streaming';
  const stopped = Boolean(turn.stopped) && !streaming;
  if (!streaming && !stopped && entries.length === 0) {
    return null;
  }

  const plural = count === 1 ? 'step' : 'steps';
  // A finished answer folds its steps away, so its summary still confirms what it took.
  const taken = added.filter((message) => message.status === 'applied');
  const tookNote =
    taken.length === 1
      ? ` · took “${taken[0].text}”`
      : taken.length > 1
        ? ` · took your ${taken.length} added messages`
        : '';
  const summary = streaming
    ? count === 0
      ? 'Getting started'
      : 'Working'
    : stopped
      ? `Stopped after ${count} ${plural}`
      : `Done in ${count} ${plural}${tookNote}`;

  return (
    <div className={styles.rail} data-state={streaming ? 'working' : stopped ? 'stopped' : 'done'}>
      {/* Open while it works, and on a stopped answer the shopper may continue. */}
      <details open={streaming || (stopped && isLatest)}>
        <summary className={styles.summary}>
          {streaming && <span className={styles.pulse} aria-hidden="true" />}
          {summary}
          {streaming && <span className={styles.dots} aria-hidden="true" />}
        </summary>
        <ol className={styles.list} aria-label="What the assistant did">
          {entries.map((entry) =>
            entry.kind === 'step' ? (
              <li key={entry.id} className={styles.step} data-done={entry.done}>
                {entry.text}
              </li>
            ) : (
              <li key={entry.id} className={styles.added} data-status={entry.status}>
                <span className={styles.addedText}>“{entry.text}”</span>
                <span className={styles.addedStatus}>{ADDED_LABELS[entry.status]}</span>
              </li>
            )
          )}
        </ol>
      </details>
      {stopped && (
        <p className={styles.stoppedNote}>
          It kept the work it had done.
          {onContinue && (
            <button type="button" className={styles.continueButton} onClick={onContinue}>
              Continue
            </button>
          )}
        </p>
      )}
    </div>
  );
}
