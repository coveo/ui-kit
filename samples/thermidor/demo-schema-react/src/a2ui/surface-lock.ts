import {createContext} from 'react';

/** True while a state-changing request is in flight: the active turn's controls are locked. */
export const SurfaceLockContext = createContext(false);

export const SurfaceLockProvider = SurfaceLockContext.Provider;
