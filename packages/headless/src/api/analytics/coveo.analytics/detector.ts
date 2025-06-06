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
  return Boolean(hasNavigator() && navigator.cookieEnabled);
}
