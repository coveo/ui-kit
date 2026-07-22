export function hasWindow(): boolean {
    return typeof window !== 'undefined';
}

export function hasNavigator(): boolean {
    return typeof navigator !== 'undefined';
}

export function hasDocument(): boolean {
    return typeof document !== 'undefined';
}

export function hasLocalStorage(): boolean {
    try {
        return typeof localStorage !== 'undefined';
    } catch (error) {
        return false;
    }
}

export function hasSessionStorage(): boolean {
    try {
        return typeof sessionStorage !== 'undefined';
    } catch (error) {
        return false;
    }
}

export function hasCookieStorage(): boolean {
    return hasNavigator() && navigator.cookieEnabled;
}

export function hasCrypto(): boolean {
    return typeof crypto !== 'undefined';
}

export function hasCryptoRandomValues(): boolean {
    return hasCrypto() && typeof crypto.getRandomValues !== 'undefined';
}

export function hasLocation(): boolean {
    return typeof location !== 'undefined';
}
