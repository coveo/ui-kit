export function hasLocalStorage(): boolean {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
};

export function hasSessionStorage(): boolean {
    try {
      return 'sessionStorage' in window && window['sessionStorage'] !== null;
    } catch (e) {
      return false;
    }
};

export function hasCookieStorage(): boolean {
    return navigator.cookieEnabled;
};

export function hasDocument(): boolean {
    return document !== null;
};

export function hasDocumentLocation(): boolean {
    return hasDocument() && document.location !== null;
};
