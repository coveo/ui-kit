import {Fragment, useEffect, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';
import {UserPromptBubble} from './UserPromptBubble.js';
import {TurnSeparator} from './TurnSeparator.js';
import {splitTurn, type FollowUp} from './turn-segments.js';
import {TurnSurfaces} from '../../a2ui/surfaces.js';
import type {Layout} from '../layout.js';
import styles from './ConversationThread.module.css';

const NO_SURFACES: readonly string[] = [];
const NO_FOLLOW_UPS: readonly FollowUp[] = [];

interface ConversationThreadProps {
  turns: Turn[];
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  /** The render surface ids each turn draws, keyed by turn id. */
  surfacesByTurn: ReadonlyMap<string, readonly string[]>;
  /** The follow-up actions sent from each turn, keyed by turn id. */
  followUps?: ReadonlyMap<string, readonly FollowUp[]>;
  /** The turn whose follow-up is in flight, if any. */
  pendingTurnId?: string | null;
  /** PROTOTYPE (COMSHOPX-1470): where search surfaces go. Defaults to `stacked`. */
  layout?: Layout;
  /** Results-panel layouts only: whether a render surface belongs in the results panel. */
  isSearchSurface?: (surfaceId: string) => boolean;
  /** Results-panel layouts only: the search surface the results panel shows. */
  panelSurfaceId?: string;
  /** Whether a render surface is a bar of suggested next actions. */
  isActionBar?: (surfaceId: string) => boolean;
  /** The bars of next actions withdrawn because the results changed since. */
  expiredActionBars?: ReadonlySet<string>;
}

/** Which next actions are still live, as {@link renderTurnContent} needs it. */
interface ActionBarRule {
  isActionBar: (surfaceId: string) => boolean;
  expired: ReadonlySet<string>;
}

const NO_EXPIRED: ReadonlySet<string> = new Set();
const NEVER = () => false;

/** Where a turn's search surfaces go, as {@link renderTurnContent} needs it. */
interface SearchPlacement {
  isSearchSurface: (surfaceId: string) => boolean;
  panelSurfaceId: string | undefined;
}

export function ConversationThread({
  turns,
  turnRefs,
  surfacesByTurn,
  followUps,
  pendingTurnId = null,
  layout = 'stacked',
  isSearchSurface,
  panelSurfaceId,
  isActionBar = NEVER,
  expiredActionBars = NO_EXPIRED,
}: ConversationThreadProps) {
  const actionBars: ActionBarRule = {isActionBar, expired: expiredActionBars};
  const placement: SearchPlacement | undefined =
    layout !== 'stacked' && isSearchSurface ? {isSearchSurface, panelSurfaceId} : undefined;

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
                index === turns.length - 1,
                turn.id === pendingTurnId,
                placement,
                actionBars
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
 * its own exchange after it. Only the latest turn's blocks are interactive.
 *
 * A failed follow-up fails the whole turn, so its error is drawn after the exchanges it follows
 * rather than in their place.
 *
 * With a results panel, a segment's search surfaces are drawn there instead, and the segment
 * keeps a trace of each search in their place.
 *
 * Next actions only show on the latest answer, and only until the results they were suggested
 * for change: an older suggestion may name a product the agent can no longer find.
 */
function renderTurnContent(
  turn: Turn,
  surfaceIds: readonly string[],
  followUps: readonly FollowUp[],
  isLatest: boolean,
  isPending: boolean,
  placement: SearchPlacement | undefined,
  actionBars: ActionBarRule
) {
  if (turn.status === 'error' && followUps.length === 0) {
    return <ErrorTurnBlock error={turn.error} />;
  }

  const segments = splitTurn(turn, surfaceIds, followUps);
  return (
    <>
      {segments.map((segment, index) => {
        const isLastSegment = index === segments.length - 1;
        const isStreaming = isLastSegment && (turn.status === 'streaming' || isPending);
        const searchIds = placement
          ? segment.surfaceIds.filter((surfaceId) => placement.isSearchSurface(surfaceId))
          : [];
        const showsActions = isLatest && isLastSegment;
        const blockIds = segment.surfaceIds.filter((surfaceId) => {
          if (placement?.isSearchSurface(surfaceId)) return false;
          if (actionBars.isActionBar(surfaceId)) {
            return showsActions && !actionBars.expired.has(surfaceId);
          }
          return true;
        });
        // The prompt that asked for this segment: the chip text of a follow-up, else the turn's.
        const query = index === 0 ? turn.input.prompt : segment.prompt;
        return (
          <Fragment key={index}>
            {segment.prompt !== undefined && <FollowUpPrompt prompt={segment.prompt} />}
            <AgentResponseBlock response={segment.response} isStreaming={isStreaming}>
              {searchIds.map((surfaceId) => (
                <SearchTrace
                  key={surfaceId}
                  query={query}
                  isShown={surfaceId === placement?.panelSurfaceId}
                />
              ))}
              <TurnSurfaces
                surfaceIds={blockIds}
                interactive={isLatest}
                isStreaming={isStreaming}
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

/**
 * PROTOTYPE (COMSHOPX-1470): what is left in the conversation of a search whose
 * results went to the panel. Local search turns stream no text, so the client writes it.
 */
function SearchTrace({query, isShown}: {query: string | undefined; isShown: boolean}) {
  const label = query?.trim()
    ? `Searched for \u201c${query.trim()}\u201d`
    : 'Opened search results';
  return (
    <p
      className={isShown ? `${styles.searchTrace} ${styles.searchTraceShown}` : styles.searchTrace}
    >
      <span className={styles.searchTraceIcon} aria-hidden="true">
        {isShown ? '\u2190' : '\u21ba'}
      </span>
      <span>
        {label}
        <span className={styles.searchTraceStatus}>
          {isShown ? ' \u00b7 shown in results' : ' \u00b7 replaced by a newer search'}
        </span>
      </span>
    </p>
  );
}
