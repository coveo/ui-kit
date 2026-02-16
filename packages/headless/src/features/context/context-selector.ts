import type {ContextState} from './context-state.js';

export const selectContext = (state: {context?: ContextState}) => state.context;
