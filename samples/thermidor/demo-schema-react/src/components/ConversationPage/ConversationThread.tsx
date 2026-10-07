import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {RoutedTurnBlock} from './RoutedTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {commerceSurfaceIds} from '../../a2ui/surface-messages.js';
import styles from './ConversationThread.module.css';

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
}

export function ConversationThread({turns, turnRefs}: ConversationThreadProps) {
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
            <div className={styles.agentContent}>{renderTurnContent(turn)}</div>
          </div>
          {index < turns.length - 1 && <TurnSeparator />}
        </div>
      ))}
    </div>
  );
}

function renderTurnContent(turn: Turn) {
  if (turn.status === 'error') {
    return <ErrorTurnBlock error={turn.error} />;
  }

  const hasCommerceSurface = commerceSurfaceIds(turn.response.surfaces).length > 0;

  // An agent answer keeps its place even after one of its search options opened a search block.
  if (turn.status === 'complete' && hasCommerceSurface && !turn.response.agent) {
    return <RoutedTurnBlock />;
  }

  return <AgentResponseBlock response={turn.response} isStreaming={turn.status === 'streaming'} />;
}
