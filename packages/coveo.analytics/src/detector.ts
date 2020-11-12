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
    return typeof localStorage !== 'undefined';
}

export function hasSessionStorage(): boolean {
    return typeof sessionStorage !== 'undefined';
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

export function isReactNative(): boolean {
    return typeof navigator !== 'undefined' && navigator.product == 'ReactNative';
}
