import {useEffect, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from '../../../demo-schema-react/src/components/ConversationPage/AgentResponseBlock.js';
import {ErrorTurnBlock} from '../../../demo-schema-react/src/components/ConversationPage/ErrorTurnBlock.js';
import {TurnSeparator} from '../../../demo-schema-react/src/components/ConversationPage/TurnSeparator.js';
import {UserPromptBubble} from '../../../demo-schema-react/src/components/ConversationPage/UserPromptBubble.js';
import {PromptInput} from '../../../demo-schema-react/src/components/PromptInput/PromptInput.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {usePageView} from './use-page-view.js';
import styles from './AssistantPage.module.css';
import pageStyles from './pages.module.css';

interface AssistantPageProps {
  /** The prompt that opened the visit, shown until the session opens its turn. */
  prompt: string;
  visitId: number;
  /** Whether a request is in flight: the next prompt waits for it. */
  busy: boolean;
  /** Sends the shopper's next prompt in this conversation, on this visit. */
  onSend(prompt: string): void;
  onBack(): void;
}

/**
 * The assistant page (`storefront-preview-assistant`), a chat: every turn of the visit, each with
 * the shopper's prompt, the agent's reasoning and answer, and the surfaces that turn created, over
 * an input that continues the conversation.
 */
export function AssistantPage({prompt, visitId, busy, onSend, onBack}: AssistantPageProps) {
  const {turns} = usePageView(visitId, 'storefront-preview-assistant');
  const turnRefs = useRef(new Map<string, HTMLElement>());
  const latestTurnId = turns.at(-1)?.id;

  useEffect(() => {
    const turn = latestTurnId === undefined ? undefined : turnRefs.current.get(latestTurnId);
    turn?.scrollIntoView?.({behavior: 'smooth', block: 'start'});
  }, [latestTurnId]);

  return (
    <main className={`${pageStyles.page} ${styles.page}`}>
      <button type="button" className={pageStyles.back} onClick={onBack}>
        ← Back to home
      </button>
      <h1 className={pageStyles.title}>Shopping assistant</h1>
      <div className={styles.thread} role="log" aria-label="Conversation" aria-busy={busy}>
        {turns.length === 0 && <UserPromptBubble prompt={prompt} />}
        {turns.map((turn, index) => (
          <div key={turn.id}>
            {index > 0 && <TurnSeparator />}
            <article
              className={styles.turn}
              aria-label={`Turn ${index + 1}`}
              ref={(element) => {
                if (element) {
                  turnRefs.current.set(turn.id, element);
                } else {
                  turnRefs.current.delete(turn.id);
                }
              }}
            >
              <ShopperPrompt turn={turn} />
              <TurnContent turn={turn} isLatest={turn.id === latestTurnId} />
            </article>
          </div>
        ))}
      </div>
      <div className={styles.promptBar}>
        <PromptInput onSubmit={onSend} busy={busy} clearOnSubmit placeholder="Ask a follow-up..." />
      </div>
    </main>
  );
}

/** What the shopper asked: the prompt, or the text of the chip whose action opened the turn. */
function ShopperPrompt({turn: {input}}: {turn: Turn}) {
  const text = input.prompt ?? (input.action?.context as {text?: unknown} | undefined)?.text;
  return typeof text === 'string' ? <UserPromptBubble prompt={text} /> : null;
}

interface TurnContentProps {
  turn: Turn;
  /** Only the latest turn's surfaces take actions: earlier ones are read-only. */
  isLatest: boolean;
}

function TurnContent({turn, isLatest}: TurnContentProps) {
  if (turn.status === 'error') {
    return <ErrorTurnBlock error={turn.error} />;
  }
  const isStreaming = turn.status === 'streaming';
  return (
    <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
      <ViewSurfaces
        surfaces={turn.response.surfaces}
        interactive={isLatest}
        isStreaming={isStreaming}
      />
    </AgentResponseBlock>
  );
}
