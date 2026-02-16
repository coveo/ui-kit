export function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function updateQueryParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  value ? params.set(key, value) : params.delete(key);

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
  window.history.pushState(null, '', nextUrl);
}
