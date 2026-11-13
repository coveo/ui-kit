import {createContext, useContext} from 'react';

/**
 * Set on the page the shopper returned to with Back: a number that changes on every return, so
 * returning to the same page twice restores it twice. `undefined` on a page opened forward.
 */
export const ReturnedVisitContext = createContext<number | undefined>(undefined);

export function useReturnedVisit(): number | undefined {
  return useContext(ReturnedVisitContext);
}
