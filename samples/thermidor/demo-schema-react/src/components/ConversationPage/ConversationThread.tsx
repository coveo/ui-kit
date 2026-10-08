import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {TurnSurfaces} from '../../a2ui/surfaces.js';
import styles from './ConversationThread.module.css';

const NO_SURFACES: readonly string[] = [];

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  /** The render surface ids each turn draws, keyed by turn id. */
  surfacesByTurn: ReadonlyMap<string, readonly string[]>;
}

export function ConversationThread({turns, turnRefs, surfacesByTurn}: ConversationThreadProps) {
  return (
    <div className={styles.thread}>
      {turns.map((turn, index) => (
        <div key={turn.id}>
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
            <UserPromptBubble prompt={turn.input.prompt ?? ''} />
            <div className={styles.agentContent}>
              {renderTurnContent(
                turn,
                surfacesByTurn.get(turn.id) ?? NO_SURFACES,
                index === turns.length - 1
              )}
            </div>
          </div>
          {index < turns.length - 1 && <TurnSeparator />}
        </div>
      ))}
    </div>
  );
}

/**
 * A turn shows the agent's reasoning and text when an agent answered, then every block the
 * server produced for it, search blocks included. Only the latest turn's blocks are interactive.
 */
function renderTurnContent(turn: Turn, surfaceIds: readonly string[], isLatest: boolean) {
  if (turn.status === 'error') {
    return <ErrorTurnBlock error={turn.error} />;
  }

  return (
    <AgentResponseBlock response={turn.response} isStreaming={turn.status === 'streaming'}>
      <TurnSurfaces surfaceIds={surfaceIds} interactive={isLatest} />
    </AgentResponseBlock>
  );
}
