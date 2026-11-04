import type {Turn} from '@coveo/thermidor';
import {AddedMessages} from './AddedMessages.js';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {TurnSurfaces} from '../../a2ui/surfaces.js';
import {actionsDuringAnswerEnabled} from '../../env.js';
import styles from './ConversationThread.module.css';

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  /**
   * Picks a stopped answer back up, given what the shopper had asked and the messages they added
   * that the answer had taken; offered on the latest turn once it stopped.
   */
  onContinue?: (question: string | undefined, added: string[]) => void;
}

export function ConversationThread({turns, turnRefs, onContinue}: ConversationThreadProps) {
  // The shopper keeps refining the newest results during an answer, and after one that showed none.
  const newestResults = actionsDuringAnswerEnabled() ? newestResultsTurnId(turns) : undefined;
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
              {turn.addedMessages && <AddedMessages messages={turn.addedMessages} />}
              <div className={styles.agentContent}>
                {renderTurnContent(
                  turn,
                  index === turns.length - 1 || turn.id === newestResults,
                  index === turns.length - 1 && onContinue
                    ? () => onContinue(prompt, takenMessages(turn))
                    : undefined
                )}
              </div>
            </div>
            {next !== undefined && !next.input.action && <TurnSeparator />}
          </div>
        );
      })}
    </div>
  );
}

/** Blocks that suggest what to do next rather than show results. */
const NOT_RESULTS = new Set(['NextActionsBar']);

/**
 * The turn whose results are the newest the shopper sees: the latest turn that has ended and shows
 * result blocks. An answer still streaming does not count, since the agent may still rewrite its
 * blocks, and neither does one that only suggests follow-ups.
 */
function newestResultsTurnId(turns: readonly Turn[]): string | undefined {
  for (let index = turns.length - 1; index >= 0; index--) {
    const turn = turns[index];
    const showsBlocks = turn.status === 'complete' || (turn.status === 'error' && turn.stopped);
    const showsResults = turn.response.surfaces.some(
      (surface) => !NOT_RESULTS.has(surface.rootComponentType)
    );
    if (showsBlocks && showsResults) {
      return turn.id;
    }
  }
  return undefined;
}

/** The messages the shopper added to `turn` that its answer had taken into account. */
function takenMessages(turn: Turn): string[] {
  return (turn.addedMessages ?? [])
    .filter((message) => message.status === 'applied')
    .map((message) => message.text);
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
 * server produced for it, search blocks included. Only the latest turn's blocks are interactive,
 * and, when actions during an answer are on, the newest results the shopper may keep refining.
 */
function renderTurnContent(turn: Turn, interactive: boolean, onContinue?: () => void) {
  // A stopped answer the client cut off itself still shows what it streamed.
  if (turn.status === 'error' && !turn.stopped) {
    return <ErrorTurnBlock error={turn.error} />;
  }

  const isStreaming = turn.status === 'streaming';
  return (
    <AgentResponseBlock response={turn.response} isStreaming={isStreaming}>
      <TurnSurfaces
        surfaces={turn.response.surfaces}
        interactive={interactive}
        isStreaming={isStreaming}
      />
      {turn.stopped && !isStreaming && (
        <p className={styles.stoppedNote}>
          Stopped
          {onContinue && (
            <button type="button" className={styles.continueButton} onClick={onContinue}>
              Continue
            </button>
          )}
        </p>
      )}
    </AgentResponseBlock>
  );
}
