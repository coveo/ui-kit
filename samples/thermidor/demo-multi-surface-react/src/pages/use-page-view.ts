import {useCallback} from 'react';
import {useTurnViews, useViewSurfaces} from '../session/storefront-session.js';

/**
 * One page visit: its turns oldest first, the latest one, the surfaces its turns created, and which
 * turns are its own.
 */
export function usePageView(visitId: number) {
  const {turnVisits} = useTurnViews();
  const {surfacesOfVisit, turnsOfVisit} = useViewSurfaces();
  const ownsTurn = useCallback(
    (turnId: string) => turnVisits.get(turnId) === visitId,
    [turnVisits, visitId]
  );
  const turns = turnsOfVisit(visitId);
  return {
    turns,
    turn: turns.at(-1),
    surfaces: surfacesOfVisit(visitId),
    ownsTurn,
  };
}
