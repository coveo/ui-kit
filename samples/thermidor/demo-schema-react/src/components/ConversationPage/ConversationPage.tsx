import type {Turn} from '@coveo/thermidor';
import {useRef} from 'react';
import {useAutoScroll} from '../../hooks/use-auto-scroll.js';
import {PromptInput} from '../PromptInput/PromptInput.js';
import {ConversationThread} from './ConversationThread.js';
import type {FollowUp} from './turn-segments.js';
import type {Layout} from '../layout.js';
import {SearchPanel} from '../SearchPanel/SearchPanel.js';
import {ChatWindow} from '../ChatWindow/ChatWindow.js';
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
  /** PROTOTYPE (COMSHOPX-1470): how search results are placed. Defaults to `stacked`. */
  layout?: Layout;
  /** Results-panel layouts only: whether a render surface belongs in the results panel. */
  isSearchSurface?: (surfaceId: string) => boolean;
  /** Results-panel layouts only: the search surface the results panel shows. */
  panelSurfaceId?: string;
  /** Whether a render surface is a bar of suggested next actions. */
  isActionBar?: (surfaceId: string) => boolean;
  /** The bars of next actions withdrawn because the results changed since. */
  expiredActionBars?: ReadonlySet<string>;
  /** Whether the conversation holds visual answer blocks, which need a wider chat window. */
  hasAnswerBlocks?: boolean;
}

/**
 * The single page of the demo: every turn, search or conversation, in one feed, with the prompt
 * pinned below it. With a floating chat, the latest search fills the page and the feed floats
 * over it.
 */
export function ConversationPage({
  onSubmit,
  isStreaming,
  promptDisabled = isStreaming,
  turns,
  surfacesByTurn,
  followUps,
  pendingTurnId,
  layout = 'stacked',
  isSearchSurface,
  panelSurfaceId,
  isActionBar,
  expiredActionBars,
  hasAnswerBlocks = false,
}: ConversationPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useAutoScroll({containerRef, turnRefs, turns, isStreaming});

  const conversation = (
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
            layout={layout}
            isSearchSurface={isSearchSurface}
            panelSurfaceId={panelSurfaceId}
            isActionBar={isActionBar}
            expiredActionBars={expiredActionBars}
          />
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

  if (layout === 'stacked') {
    return conversation;
  }

  // A turn the agent answers, rather than one routed to a search.
  const latestTurn = turns.at(-1);
  const answerKey = latestTurn?.response.agent?.messages.some((message) => message.content)
    ? latestTurn.id
    : undefined;

  return (
    <div className={styles.floatingLayout}>
      <SearchPanel
        surfaceId={panelSurfaceId}
        isStreaming={isStreaming}
        promptDisabled={promptDisabled}
        onSubmit={onSubmit}
      />
      <ChatWindow isStreaming={isStreaming} answerKey={answerKey} wide={hasAnswerBlocks}>
        {conversation}
      </ChatWindow>
    </div>
  );
}
