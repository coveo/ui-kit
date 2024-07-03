export interface NavigatorContext {
  referrer: string | null;
  userAgent: string | null;
  location: string | null;
  clientId: string;
}

export type NavigatorContextProvider = () => NavigatorContext;
export type BrowserNavigatorContextProvider = (
  clientId: string
) => NavigatorContext;

export const defaultBrowserNavigatorContextProvider: BrowserNavigatorContextProvider =
  (clientId: string) => ({
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    location: window.location.href,
    clientId,
  });

export const defaultNodeJSNavigatorContextProvider: NavigatorContextProvider =
  () => ({
    referrer: null,
    userAgent: null,
    location: null,
    clientId: '',
  });
