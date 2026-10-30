import {Fragment, useEffect, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {isLatestTurn, splitTurn, type FollowUp} from './turn-segments.js';
import {SurfaceGroup} from '../../a2ui/surfaces.js';
import styles from './ConversationThread.module.css';

const NO_SURFACES: readonly string[] = [];
const NO_FOLLOW_UPS: readonly FollowUp[] = [];
const EARLIER_TURN_NOTE = 'Earlier results. Ask a follow-up or search again to refine.';

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  /** The render surface ids each turn draws, keyed by turn id. */
  surfacesByTurn: ReadonlyMap<string, readonly string[]>;
  /** The follow-up actions sent from each turn, keyed by turn id. */
  followUps?: ReadonlyMap<string, readonly FollowUp[]>;
  /** The turn whose follow-up is in flight, if any. */
  pendingTurnId?: string | null;
  /** Asks a question as the user's next message, from the latest answer's follow-up questions. */
  onAskFollowUp?: (question: string) => void;
}

export function ConversationThread({
  turns,
  turnRefs,
  surfacesByTurn,
  followUps,
  pendingTurnId = null,
  onAskFollowUp,
}: ConversationThreadProps) {
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
                followUps?.get(turn.id) ?? NO_FOLLOW_UPS,
                isLatestTurn(turns, turn.id),
                turn.id === pendingTurnId,
                onAskFollowUp
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
 * server produced for it, search blocks included. Each follow-up sent from the turn is drawn as
 * its own exchange after it. Only the latest turn's blocks are interactive, and only its last
 * answer offers its follow-up questions.
 *
 * A failed follow-up fails the whole turn, so its error is drawn after the exchanges it follows
 * rather than in their place.
 */
function renderTurnContent(
  turn: Turn,
  surfaceIds: readonly string[],
  followUps: readonly FollowUp[],
  isLatest: boolean,
  isPending: boolean,
  onAskFollowUp?: (question: string) => void
) {
  if (turn.status === 'error' && followUps.length === 0) {
    return <ErrorTurnBlock error={turn.error} />;
  }

  const segments = splitTurn(turn, surfaceIds, followUps);
  return (
    <>
      {segments.map((segment, index) => {
        const isStreaming =
          index === segments.length - 1 && (turn.status === 'streaming' || isPending);
        return (
          <Fragment key={index}>
            {segment.prompt !== undefined && <FollowUpPrompt prompt={segment.prompt} />}
            <AgentResponseBlock
              response={segment.response}
              isStreaming={isStreaming}
              onAskFollowUp={isLatest && index === segments.length - 1 ? onAskFollowUp : undefined}
            >
              <SurfaceGroup
                surfaceIds={segment.surfaceIds}
                interactive={isLatest}
                isStreaming={isStreaming}
                readOnlyNote={EARLIER_TURN_NOTE}
              />
            </AgentResponseBlock>
          </Fragment>
        );
      })}
      {turn.status === 'error' && <ErrorTurnBlock error={turn.error} />}
    </>
  );
}

/** The chip text of a follow-up, shown as the shopper's message and scrolled into view. */
function FollowUpPrompt({prompt}: {prompt: string}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView?.({behavior: 'smooth', block: 'start'});
  }, []);

  return (
    <div className={styles.followUp} ref={ref}>
      <UserPromptBubble prompt={prompt} />
    </div>
  );
}
