import {useMemo} from 'react';
import type {DiscoveredSurface} from '@coveo/thermidor';
import {
  SessionRequestProvider,
  type SessionRequestSource,
} from '../../../demo-schema-react/src/a2ui/session-request.js';
import {TurnSurfaces} from '../../../demo-schema-react/src/a2ui/surfaces.js';
import {useSession} from '../session/storefront-session.js';

interface ViewSurfacesProps {
  /** The surfaces to draw, in order. */
  surfaces: readonly DiscoveredSurface[];
  /**
   * Whether a turn belongs to this view. A prompt in flight on one of its turns, or an action from
   * one of its surfaces, locks the surfaces, as `demo-schema-react` locks the active surface;
   * another view's request does not. An action is told apart by its surface rather than its turn:
   * one that opens no turn streams into the session's latest turn, which may be another view's.
   */
  ownsTurn(turnId: string): boolean;
  /** Whether the view's turn is streaming. */
  isStreaming: boolean;
}

/**
 * Draws a view's surfaces with `demo-schema-react`'s `TurnSurfaces`: in order, a loading
 * placeholder as its component's skeleton, locked while the view's own request is in flight.
 */
export function ViewSurfaces({surfaces, ownsTurn, isStreaming}: ViewSurfacesProps) {
  const session = useSession();
  const source = useMemo<SessionRequestSource>(
    () => ({
      getSnapshot() {
        const snapshot = session.getSnapshot();
        const {request} = snapshot;
        if (!request) {
          return snapshot;
        }
        const owned =
          request.kind === 'action'
            ? surfaces.some(({surfaceId}) => surfaceId === request.surfaceId)
            : ownsTurn(request.turnId);
        return owned ? snapshot : {...snapshot, request: undefined};
      },
      subscribe: session.subscribe,
      sendAndWait: session.sendAndWait,
    }),
    [session, ownsTurn, surfaces]
  );
  return (
    <SessionRequestProvider value={source}>
      <TurnSurfaces surfaces={surfaces} interactive isStreaming={isStreaming} />
    </SessionRequestProvider>
  );
}
