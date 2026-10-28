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
  /** The prompt waits while a request that locks the surface is in flight. */
  promptDisabled?: boolean;
  turns: Turn[];
  /** The render surface ids each turn draws, keyed by turn id. */
  surfacesByTurn: ReadonlyMap<string, readonly string[]>;
  /** The follow-up actions sent from each turn, keyed by turn id. */
  followUps?: ReadonlyMap<string, readonly FollowUp[]>;
  /** The turn whose follow-up is in flight, if any. */
  pendingTurnId?: string | null;
  /** Leaves this conversation for an empty one. */
  onNewConversation?: () => void;
  /** The conversation is only shown: it can't be continued. */
  readOnly?: boolean;
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
  surfacesByTurn,
  followUps,
  pendingTurnId,
  onNewConversation,
  readOnly = false,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, turns, isStreaming});

  return (
    <section className={styles.page}>
      {readOnly ? (
        <div className={styles.readOnlyBanner} role="status">
          <span>This conversation can&apos;t be continued.</span>
          {onNewConversation && (
            <button type="button" className={styles.newConversation} onClick={onNewConversation}>
              New conversation
            </button>
          )}
        </div>
      ) : (
        onNewConversation && (
          <div className={styles.toolbar}>
            <button type="button" className={styles.newConversation} onClick={onNewConversation}>
              New conversation
            </button>
          </div>
        )
      )}
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
            onAskFollowUp={promptDisabled || readOnly ? undefined : onSubmit}
            readOnly={readOnly}
          />
        </div>
      </div>
      {!readOnly && (
        <div className={styles.promptBar}>
          <PromptInput
            onSubmit={onSubmit}
            disabled={promptDisabled}
            clearOnSubmit
            placeholder="Search or ask anything..."
          />
        </div>
      )}
    </section>
  );
}
