export function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Update URL query parameters without page reload
 *
 * Manages browser history and URL state for search queries.
 *
 * @param key - Query parameter key (e.g., 'q' for search query)
 * @param value - Parameter value (empty string removes the parameter)
 *
 * @example
 * ```typescript
 * updateQueryParam('q', 'coffee');     // ?q=coffee
 * updateQueryParam('q', '');           // removes ?q parameter
 * updateQueryParam('sort', 'price');   // ?q=coffee&sort=price
 * ```
 */
export function updateQueryParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  value ? params.set(key, value) : params.delete(key);

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
  window.history.pushState(null, '', nextUrl);
}
