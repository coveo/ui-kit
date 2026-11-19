import type {Turn} from '@coveo/thermidor';
import {useRef, useState} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import {SessionSearchBox} from '../SessionSearchBox/SessionSearchBox.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {ConversationThread} from './ConversationThread.js';
import styles from './ConversationPage.module.css';

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  /** The prompt waits while a request that locks the surface is in flight. */
  promptDisabled?: boolean;
  /**
   * The conversation expired: its transcript can be read but not used, and a prompt starts a new
   * conversation.
   */
  expired?: boolean;
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
  expired = false,
  turns,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // A page that opens on a finished turn shows a restored conversation, from its last prompt.
  const [restored] = useState(() => turns.at(-1)?.status !== 'streaming');
  useAutoScroll({containerRef, turnRefs, turns, restored});

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
          {/* Always rendered, so the turns stay mounted when the conversation turns out expired. */}
          <fieldset className={styles.thread} disabled={expired}>
            <ConversationThread turns={turns} turnRefs={turnRefs} readOnly={expired} />
          </fieldset>
        </div>
      </div>
      {expired && (
        <p className={styles.expired} role="status">
          This conversation expired. Sending a prompt starts a new one.
        </p>
      )}
      <div className={styles.promptBar}>
        {/* The shell's search box would send suggestion requests to the expired session. */}
        {expired ? (
          <PromptInput
            onSubmit={onSubmit}
            clearOnSubmit
            placeholder="Start a new conversation..."
          />
        ) : (
          <SessionSearchBox
            onSubmit={onSubmit}
            busy={promptDisabled}
            clearOnSubmit
            placeholder="Search or ask anything..."
            suggestionsPlacement="above"
          />
        )}
      </div>
    </section>
  );
}
