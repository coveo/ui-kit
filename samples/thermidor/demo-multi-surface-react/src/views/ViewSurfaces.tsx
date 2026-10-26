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
  const source = useMemo<SessionRequestSource>(
    () => ({
      getSnapshot() {
        const snapshot = session.getSnapshot();
        const {request} = snapshot;
        return request && !ownsTurn(request.turnId) ? {...snapshot, request: undefined} : snapshot;
      },
      subscribe: session.subscribe,
      sendAndWait: session.sendAndWait,
    }),
    [session, ownsTurn]
  );
  return (
    <SessionRequestProvider value={source}>
      <TurnSurfaces surfaces={surfaces} interactive isStreaming={isStreaming} />
    </SessionRequestProvider>
  );
}
