const pendragonCookieValueMatcher = /(^|; )Coveo-Pendragon=([^;]*)/;
const searchAgentDebugCookieValueMatcher =
  /(^|; )Coveo-SearchAgentDebug=([^;]*)/;
export function getMagicCookie() {
  if (typeof window === 'undefined') {
    return false;
  } else {
    return pendragonCookieValueMatcher.exec(document.cookie)?.pop() || null;
  }
}

export function getSearchAgentDebugMagicCookie() {
  if (typeof window === 'undefined') {
    return false;
  } else {
    return searchAgentDebugCookieValueMatcher.test(document.cookie);
  }
}
