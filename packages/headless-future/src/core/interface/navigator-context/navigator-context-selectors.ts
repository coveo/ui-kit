import {navigatorContextSlice} from '@/src/core/internal/navigator-context/navigator-context-slice.js';
import type {NavigatorContextState} from './navigator-context-types.js';

type StateWithNavigatorContextSlice = {navigatorContext: NavigatorContextState};

export const clientId = (state: StateWithNavigatorContextSlice) =>
  navigatorContextSlice.selectors.clientId(state);

export const userAgent = (state: StateWithNavigatorContextSlice) =>
  navigatorContextSlice.selectors.userAgent(state);

export const url = (state: StateWithNavigatorContextSlice) =>
  navigatorContextSlice.selectors.url(state);

export const referrer = (state: StateWithNavigatorContextSlice) =>
  navigatorContextSlice.selectors.referrer(state);
