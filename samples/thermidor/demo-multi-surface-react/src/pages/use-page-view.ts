import {useCallback, useMemo} from 'react';
import {useScheduler, useSessionSnapshot} from '../session/storefront-session.js';
import {buildPageView} from '../views/view-surfaces.js';

/** The page being shown: the turn of its prompt, the surfaces it created, and which turn is its own. */
export function usePageView() {
  const scheduler = useScheduler();
  const {turns} = useSessionSnapshot();
  // The scheduler learns the page turn right after the session opens it, and every stream event
  // that follows re-renders, so the page draws nothing for its first render at most.
  const {pageTurnId} = scheduler;
  const view = useMemo(() => buildPageView(turns, pageTurnId), [turns, pageTurnId]);
  const ownsTurn = useCallback((turnId: string) => turnId === pageTurnId, [pageTurnId]);
  return {...view, ownsTurn};
}
