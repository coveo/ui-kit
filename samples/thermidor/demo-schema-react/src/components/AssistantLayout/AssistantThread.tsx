import type {Turn} from '@coveo/thermidor';
import {TurnSurfaces} from '../../a2ui/surfaces.js';
import {continuePrompt} from '../ConversationPage/ConversationPage.js';
import {shopperPrompt} from '../ConversationPage/ConversationThread.js';
import {ErrorTurnBlock} from '../ConversationPage/ErrorTurnBlock.js';
import {StreamingMessage} from '../ConversationPage/StreamingMessage.js';
import {UserPromptBubble} from '../ConversationPage/UserPromptBubble.js';
import {SuggestionPills} from '../SuggestionPills/SuggestionPills.js';
import {ActivityRail} from './ActivityRail.js';
import {answerSurfaces, hasAgentContent, isSearchOnly} from './turns.js';
import styles from './AssistantThread.module.css';

const STARTERS = [
  'build me a kayak bundle for a beginner',
  'I like cold-water surfing. Compare wetsuits for it',
  'what should I pack for a snorkeling trip?',
];

interface AssistantThreadProps {
  turns: readonly Turn[];
  /** Searches typed in the results panel: they show there, not in the chat. */
  panelSearches: ReadonlySet<string>;
  onAsk: (prompt: string) => void;
}

/**
 * PROTOTYPE (HACK-408): the assistant's side of the session. Each answer shows the question, the
 * agent's activity in the shopper's words, its text and its blocks; search results go to the
 * results panel, so a question the gateway answered with a search leaves a one-line trace.
 */
export function AssistantThread({turns, panelSearches, onAsk}: AssistantThreadProps) {
  function isHiddenPanelSearch(turn: Turn): boolean {
    const prompt = turn.input.prompt;
    return (
      prompt !== undefined &&
      panelSearches.has(prompt) &&
      !hasAgentContent(turn) &&
      answerSurfaces(turn).length === 0
    );
  }

  const visible = turns.filter((turn) => !isHiddenPanelSearch(turn));
  const latestAnswerId = visible.filter((turn) => !isSearchOnly(turn)).at(-1)?.id;
  const lastTurnId = turns.at(-1)?.id;

  if (visible.length === 0) {
    return (
      <div className={styles.greeting}>
        <p className={styles.greetingTitle}>
          Hi! I can compare products, build bundles and find the right gear.
        </p>
        <p className={styles.greetingText}>
          Keep browsing while I work: your results never wait for me.
        </p>
        <SuggestionPills onSelect={onAsk} suggestions={STARTERS} />
      </div>
    );
  }

  return (
    <div className={styles.thread}>
      {turns.map((turn) => {
        if (isHiddenPanelSearch(turn)) {
          return null;
        }
        const prompt = shopperPrompt(turn);
        if (isSearchOnly(turn)) {
          return (
            <p key={turn.id} className={styles.trace}>
              Showing “{prompt}” in the results
            </p>
          );
        }
        const isLatest = turn.id === latestAnswerId;
        const streaming = turn.status === 'streaming';
        const taken = (turn.addedMessages ?? [])
          .filter((message) => message.status === 'applied')
          .map((message) => message.text);
        return (
          <article key={turn.id} className={styles.turn} aria-label="Answer">
            {prompt && <UserPromptBubble prompt={prompt} />}
            <ActivityRail
              turn={turn}
              isLatest={isLatest}
              onContinue={
                turn.id === lastTurnId ? () => onAsk(continuePrompt(prompt, taken)) : undefined
              }
            />
            {turn.status === 'error' && !turn.stopped ? (
              <ErrorTurnBlock error={turn.error} />
            ) : (
              <>
                {turn.response.agent?.messages.some((message) => message.content) && (
                  <StreamingMessage messages={turn.response.agent.messages} />
                )}
                <TurnSurfaces
                  surfaces={answerSurfaces(turn)}
                  interactive={isLatest}
                  isStreaming={streaming}
                />
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
