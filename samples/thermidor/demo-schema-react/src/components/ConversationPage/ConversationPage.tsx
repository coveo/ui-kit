import type {Turn} from '@coveo/thermidor';
import {useRef} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {ConversationThread} from './ConversationThread.js';
import type {FollowUp} from './turn-segments.js';
import styles from './ConversationPage.module.css';

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  turns: Turn[];
  /** The render surface ids each turn draws, keyed by turn id. */
  surfacesByTurn: ReadonlyMap<string, readonly string[]>;
  /** The follow-up actions sent from each turn, keyed by turn id. */
  followUps?: ReadonlyMap<string, readonly FollowUp[]>;
  /** The turn whose follow-up is in flight, if any. */
  pendingTurnId?: string | null;
}

/**
 * The single page of the demo: every turn, search or conversation, in one feed, with the prompt
 * pinned below it.
 */
export function ConversationPage({
  onSubmit,
  isStreaming,
  turns,
  surfacesByTurn,
  followUps,
  pendingTurnId,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, turns, isStreaming});

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
            surfacesByTurn={surfacesByTurn}
            followUps={followUps}
            pendingTurnId={pendingTurnId}
          />
        </div>
      </div>
      <div className={styles.promptBar}>
        <PromptInput
          onSubmit={onSubmit}
          disabled={isStreaming}
          clearOnSubmit
          placeholder="Search or ask anything..."
        />
      </div>
    </section>
  );
}
