export const hasLocalStorage = ((): boolean => {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
})();

export const hasSessionStorage = ((): boolean => {
    try {
      return 'sessionStorage' in window && window['sessionStorage'] !== null;
    } catch (e) {
      return false;
    }
})();

export const hasCookieStorage = ((): boolean => {
    return navigator.cookieEnabled;
});
