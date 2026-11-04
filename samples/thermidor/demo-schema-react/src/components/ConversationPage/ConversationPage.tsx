import type {Turn} from '@coveo/thermidor';
import {useRef, useState} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import {SessionSearchBox} from '../SessionSearchBox/SessionSearchBox.js';
import {ConversationThread} from './ConversationThread.js';
import styles from './ConversationPage.module.css';

/**
 * What a stopped answer's Continue asks. Repeating the question routes it to the flow that was
 * answering, and the agent picks up from the work it had done.
 */
export function continuePrompt(question: string | undefined): string {
  return question ? `Continue: ${question}` : 'Continue where you left off.';
}

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  /** The prompt waits while a request that locks the surface is in flight. */
  promptDisabled?: boolean;
  /** A question sent now is added to the answer in progress. */
  canAddToAnswer?: boolean;
  /** Stops the answer in progress; the Stop button shows only while one streams. */
  onStop?: () => void;
  turns: Turn[];
}

/**
 * The single page of the demo: every turn, search or conversation, in one feed, with the prompt
 * pinned below it.
 */
export function ConversationPage({
  onSubmit,
  isStreaming,
  promptDisabled = isStreaming,
  canAddToAnswer = false,
  onStop,
  turns,
}: ConversationPageProps) {
  // The answer the shopper asked to stop shows "Stopping…" until its stream ends.
  const streamingTurnId = turns.find((turn) => turn.status === 'streaming')?.id;
  const [stopRequestedFor, setStopRequestedFor] = useState<string>();
  const stopping = streamingTurnId !== undefined && stopRequestedFor === streamingTurnId;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, turns});

  return (
    <section className={styles.page}>
      <div
        className={styles.scrollContainer}
        ref={containerRef}
        aria-busy={isStreaming}
        role="log"
        aria-label="Conversation history"
      >
        <div className={styles.scrollContent}>
          <ConversationThread
            turns={turns}
            turnRefs={turnRefs}
            onContinue={(question) => onSubmit(continuePrompt(question))}
          />
        </div>
      </div>
      <div className={styles.promptBar}>
        <div className={styles.promptRow}>
          <div className={styles.promptInput}>
            <SessionSearchBox
              onSubmit={onSubmit}
              busy={promptDisabled}
              clearOnSubmit
              placeholder={
                isStreaming && canAddToAnswer ? 'Add to this answer…' : 'Search or ask anything...'
              }
              suggestionsPlacement="above"
            />
          </div>
          {onStop && isStreaming && (
            <button
              type="button"
              className={styles.stopButton}
              onClick={() => {
                setStopRequestedFor(streamingTurnId);
                onStop();
              }}
              disabled={stopping}
              aria-label="Stop the answer"
            >
              {stopping ? 'Stopping…' : 'Stop'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
