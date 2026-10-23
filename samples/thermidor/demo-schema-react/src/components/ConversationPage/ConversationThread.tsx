import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {TurnSurfaces} from '../../a2ui/surfaces.js';
import styles from './ConversationThread.module.css';

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
}

export function ConversationThread({turns, turnRefs}: ConversationThreadProps) {
  return (
    <div className={styles.thread}>
      {turns.map((turn, index) => {
        const prompt = shopperPrompt(turn);
        const next = turns[index + 1];
        return (
          // A turn opened by a chip continues the answer above it: no separator, only space.
          <div
            key={turn.id}
            className={index > 0 && turn.input.action ? styles.followUp : undefined}
          >
            <div
              className={styles.turnWrapper}
              role="article"
              aria-label={`Turn ${index + 1}`}
              ref={(el) => {
                if (el) {
                  turnRefs.current.set(turn.id, el);
                }
              }}
            >
              {prompt && <UserPromptBubble prompt={prompt} />}
              <div className={styles.agentContent}>
                {renderTurnContent(turn, index === turns.length - 1)}
              </div>
            </div>
            {next !== undefined && !next.input.action && <TurnSeparator />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * What the shopper asked: the prompt, or the text of the `NextActionsBar` chip, a follow-up or a
 * search option, whose action opened the turn.
 */
function shopperPrompt({input}: Turn): string | undefined {
  if (input.prompt !== undefined) {
    return input.prompt;
  }
  const text = (input.action?.context as {text?: unknown} | undefined)?.text;
  return typeof text === 'string' ? text : undefined;
}

/**
 * A turn shows the agent's reasoning and text when an agent answered, then every block the
 * server produced for it, search blocks included. Only the latest turn's blocks are interactive.
 */
function renderTurnContent(turn: Turn, isLatest: boolean) {
  if (turn.status === 'error') {
    return <ErrorTurnBlock error={turn.error} />;
  }

  const isStreaming = turn.status === 'streaming';
  return (
    <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
      <TurnSurfaces
        surfaceIds={turn.response.surfaces.map((surface) => surface.surfaceId)}
        interactive={isLatest}
        isStreaming={isStreaming}
      />
    </AgentResponseBlock>
  );
}
