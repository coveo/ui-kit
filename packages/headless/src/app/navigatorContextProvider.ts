export interface NavigatorContext {
  referrer: string | null;
  userAgent: string | null;
  location: string | null;
}

export type NavigatorContextProvider = () => NavigatorContext;

export const defaultBrowserNavigatorContextProvider: NavigatorContextProvider =
  () => ({
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    location: window.location.href,
  });

export const defaultNodeJSNavigatorContextProvider: NavigatorContextProvider =
  () => ({
    referrer: null,
    userAgent: null,
    location: null,
  });
