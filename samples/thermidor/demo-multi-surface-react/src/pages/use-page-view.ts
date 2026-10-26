import {useCallback} from 'react';
import {useScheduler, useViewSurfaces} from '../session/storefront-session.js';

/** One page visit: its latest turn, the surfaces its turns created, and which turns are its own. */
export function usePageView(visitId: number) {
  const scheduler = useScheduler();
  const {surfacesOfVisit, turnsOfVisit} = useViewSurfaces();
  const ownsTurn = useCallback(
    (turnId: string) => scheduler.turnVisits.get(turnId) === visitId,
    [scheduler, visitId]
  );
  return {
    turn: turnsOfVisit(visitId).at(-1),
    surfaces: surfacesOfVisit(visitId),
    ownsTurn,
  };
}
