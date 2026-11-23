import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {turnStartTarget} from '../../a2ui/results-focus.js';
import {ProgressSurfaces, splitProgressSurfaces, TurnSurfaces} from '../../a2ui/surfaces.js';
import styles from './ConversationThread.module.css';

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  /** Draws every turn as an earlier one, the latest included. */
  readOnly?: boolean;
}

export function ConversationThread({turns, turnRefs, readOnly = false}: ConversationThreadProps) {
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
              {...turnStartTarget}
              ref={(el) => {
                if (el) {
                  turnRefs.current.set(turn.id, el);
                }
              }}
            >
              {prompt && <UserPromptBubble prompt={prompt} />}
              <div className={styles.agentContent}>
                {renderTurnContent(turn, !readOnly && index === turns.length - 1, readOnly)}
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
 * A turn shows the agent's progress, or its tool calls, and its text when an agent answered, then
 * every block the server produced for it, search blocks included. Only the latest turn's blocks are
 * interactive. A failed turn keeps its progress above the error, to show where it stopped.
 */
function renderTurnContent(turn: Turn, isLatest: boolean, expired: boolean) {
  const {progress, blocks} = splitProgressSurfaces(turn.response.surfaces);
  const failed = turn.status === 'error';
  const isStreaming = turn.status === 'streaming';
  const hasProgress = progress.length > 0;

  // The progress keeps its place when the turn fails, so its live region is not recreated.
  return (
    <>
      {hasProgress && <ProgressSurfaces surfaces={progress} turnFailed={failed} />}
      {failed ? (
        <ErrorTurnBlock error={turn.error} />
      ) : (
        <AgentResponseBlock
          response={turn.response}
          isStreaming={isStreaming}
          hasProgress={hasProgress}
        >
          <TurnSurfaces
            surfaces={blocks}
            latest={isLatest}
            isStreaming={isStreaming}
            expired={expired}
          />
        </AgentResponseBlock>
      )}
    </>
  );
}
