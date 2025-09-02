/** biome-ignore-all lint/suspicious/noDocumentCookie: <> */
/**
 * Sets a document cookie with the provided name, value, path, and maxAge.
 *
 * @param name - The name of the cookie.
 * @param value - The value of the cookie.
 * @param path - The path of the cookie. Defaults to '/'.
 * @param maxAge - The maximum age of the cookie. Default to 1 year.
 */
export function setCookie(
  name: string,
  value: string,
  path = '/',
  maxAge = 60 * 60 * 24 * 365
) {
  document.cookie = `${name}=${value}; path=${path}; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * Removes a document cookie with the provided name.
 *
 * @param name - The name of the cookie to remove.
 */
export function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=-1`;
}
