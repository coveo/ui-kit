import {navigatorContextSlice} from '@/src/core/internal/navigator-context/navigator-context-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {NavigatorContextState} from './navigator-context-types.js';

export const setClientId = (clientId: string): StateMutation => {
  return navigatorContextSlice.actions.setClientId(clientId);
};

export const setUserAgent = (userAgent: string | null): StateMutation => {
  return navigatorContextSlice.actions.setUserAgent(userAgent);
};

export const setUrl = (url: string | null): StateMutation => {
  return navigatorContextSlice.actions.setUrl(url);
};

export const setReferrer = (referrer: string | null): StateMutation => {
  return navigatorContextSlice.actions.setReferrer(referrer);
};

export const setNavigatorContext = (
  context: NavigatorContextState
): StateMutation => {
  return navigatorContextSlice.actions.setNavigatorContext(context);
};
