import {useCallback, useMemo} from 'react';
import type {DiscoveredSurface, SessionRequest} from '@coveo/thermidor';
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
   * Whether a turn belongs to this view. A request in flight on one of its turns locks the
   * surfaces, as `demo-schema-react` locks the active surface; another view's request does not.
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
  // An action streams into the session's active turn, which belongs to another view once the
  // shopper has gone back to an earlier page, so its surface tells whose it is.
  const ownsRequest = useCallback(
    (request: SessionRequest) =>
      ownsTurn(request.turnId) ||
      (request.kind === 'action' &&
        surfaces.some(({surfaceId}) => surfaceId === request.surfaceId)),
    [ownsTurn, surfaces]
  );
  const source = useMemo<SessionRequestSource>(
    () => ({
      getSnapshot() {
        const snapshot = session.getSnapshot();
        const {request} = snapshot;
        return request && !ownsRequest(request) ? {...snapshot, request: undefined} : snapshot;
      },
      subscribe: session.subscribe,
      sendAndWait: session.sendAndWait,
    }),
    [session, ownsRequest]
  );
  return (
    <SessionRequestProvider value={source}>
      <TurnSurfaces surfaces={surfaces} interactive isStreaming={isStreaming} />
    </SessionRequestProvider>
  );
}
