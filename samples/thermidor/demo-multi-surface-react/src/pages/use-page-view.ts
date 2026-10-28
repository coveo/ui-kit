import {useMemo} from 'react';
import {useViewSurfaces, type StorefrontView} from '../session/storefront-session.js';

/** One view of a page visit: its turns, the latest of them, and the surfaces they created. */
export function usePageView(visitId: number, view: StorefrontView) {
  const viewSurfaces = useViewSurfaces();
  return useMemo(() => {
    const turns = viewSurfaces.turnsOfView({visitId, view});
    return {turns, turn: turns.at(-1), surfaces: viewSurfaces.surfacesOfView({visitId, view})};
  }, [viewSurfaces, visitId, view]);
}
