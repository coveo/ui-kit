const pendragonCookieValueMatcher = /(^|; )Coveo-Pendragon=([^;]*)/;
export default function getMagicCookie() {
  if (typeof window === 'undefined') {
    return false;
  } else {
    return pendragonCookieValueMatcher.exec(document.cookie)?.pop() || null;
  }
}
