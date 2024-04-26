export interface NavigatorContext {
  referrer: string;
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
    referrer: 'default',
    userAgent: 'Node.js',
    location: 'default',
  });
