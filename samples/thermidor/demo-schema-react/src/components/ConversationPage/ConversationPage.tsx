import type {Turn} from '@coveo/thermidor';
import {useRef} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import {SessionSearchBox} from '../SessionSearchBox/SessionSearchBox.js';
import {ConversationThread} from './ConversationThread.js';
import styles from './ConversationPage.module.css';

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  /** The prompt waits while a request that locks the surface is in flight. */
  promptDisabled?: boolean;
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
  turns,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, latestTurnId: turns.at(-1)?.id ?? null});

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
          <ConversationThread turns={turns} turnRefs={turnRefs} />
        </div>
      </div>
      <div className={styles.promptBar}>
        <SessionSearchBox
          onSubmit={onSubmit}
          busy={promptDisabled}
          clearOnSubmit
          placeholder="Search or ask anything..."
          suggestionsPlacement="above"
        />
      </div>
    </section>
  );
}
