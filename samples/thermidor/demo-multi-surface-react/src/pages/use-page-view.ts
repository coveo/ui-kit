import {useCallback, useMemo} from 'react';
import {useTurnViews, useViewSurfaces, type StorefrontView} from '../session/storefront-session.js';

/**
 * One view of a page visit: its turns, the latest of them, the surfaces they created, and which
 * turns are its own.
 */
export function usePageView(visitId: number, view: StorefrontView) {
  const {turnViews, turnVisits} = useTurnViews();
  const viewSurfaces = useViewSurfaces();
  const ownsTurn = useCallback(
    (turnId: string) => turnVisits.get(turnId) === visitId && turnViews.get(turnId) === view,
    [turnViews, turnVisits, visitId, view]
  );
  return useMemo(() => {
    const turns = viewSurfaces.turnsOfView({visitId, view});
    return {
      turns,
      turn: turns.at(-1),
      surfaces: viewSurfaces.surfacesOfView({visitId, view}),
      ownsTurn,
    };
  }, [viewSurfaces, visitId, view, ownsTurn]);
}
