import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {RoutedTurnBlock} from './RoutedTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
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

const COMMERCE_SEARCH_ROOT_TYPE = 'CommerceSearch';

function renderTurnContent(turn: Turn) {
  if (turn.status === 'error') {
    return <ErrorTurnBlock error={turn.error} />;
  }

  const hasCommerceSurface = turn.response.surfaces.some(
    (s) => s.rootComponentType === COMMERCE_SEARCH_ROOT_TYPE
  );

  if (turn.status === 'complete' && hasCommerceSurface) {
    return <RoutedTurnBlock />;
  }

  return <AgentResponseBlock response={turn.response} isStreaming={turn.status === 'streaming'} />;
}
