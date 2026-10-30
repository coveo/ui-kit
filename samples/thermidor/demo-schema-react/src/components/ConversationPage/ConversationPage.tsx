import type {Turn} from '@coveo/thermidor';
import {useRef} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import type {ScopingSurface} from '../../a2ui/surface-stream.js';
import {ConversationThread} from './ConversationThread.js';
import {ScopingPanel} from './ScopingPanel.js';
import {isLatestTurn, type FollowUp} from './turn-segments.js';
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
  /** The latest Scoping block, shown for the whole thread. */
  scoping?: ScopingSurface;
}

/**
 * The single page of the demo: every turn, search or conversation, in one feed, with the prompt
 * pinned below it, and the Selection that scopes the questions, when there is one, beside them.
 */
export function ConversationPage({
  onSubmit,
  isStreaming,
  promptDisabled = isStreaming,
  turns,
  surfacesByTurn,
  followUps,
  pendingTurnId,
  scoping,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, turns, isStreaming});

  return (
    <section className={styles.page}>
      <div className={styles.body}>
        {scoping && (
          <ScopingPanel
            scoping={scoping}
            interactive={isLatestTurn(turns, scoping.turnId)}
            isStreaming={isStreaming}
          />
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
              onAskFollowUp={promptDisabled ? undefined : onSubmit}
            />
          </div>
        </div>
      </div>
      <div className={styles.promptBar}>
        <PromptInput
          onSubmit={onSubmit}
          disabled={promptDisabled}
          clearOnSubmit
          placeholder="Search or ask anything..."
        />
      </div>
    </section>
  );
}
