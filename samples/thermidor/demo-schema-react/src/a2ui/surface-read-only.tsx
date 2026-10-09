import {createContext, useContext} from 'react';

const SurfaceReadOnlyContext = createContext(false);

/**
 * Marks the surfaces below it as read-only. The session only sends actions for the surfaces of
 * its active turn, so the blocks of earlier turns stay readable but cannot be acted on.
 */
export const SurfaceReadOnlyProvider = SurfaceReadOnlyContext.Provider;

/** True when the surface this component is drawn in cannot dispatch actions. */
export function useSurfaceReadOnly(): boolean {
  return useContext(SurfaceReadOnlyContext);
}
