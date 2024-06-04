export interface NavigatorContext {
  referrer: string | null;
  userAgent: string;
  location: string;
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
    userAgent: 'Node.js',
    location: 'default',
  });
