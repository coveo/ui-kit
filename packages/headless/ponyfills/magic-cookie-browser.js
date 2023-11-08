const pendragonCookieValueMatcher = /(^|; )Coveo-Pendragon=([^;]*)/;
module.exports = () =>
  pendragonCookieValueMatcher.exec(document.cookie)?.pop() || null;
