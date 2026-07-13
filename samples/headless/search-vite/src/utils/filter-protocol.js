/**
 * Filters out dangerous URIs that can create XSS attacks such as `javascript:`,
 * returning an empty string for anything that is not a known-safe absolute or
 * relative URL.
 */
export function filterProtocol(uri) {
  const isAbsolute = /^(https?|ftp|file|mailto|tel|sip):/i.test(uri);
  const isRelative = /^(\/|\.\/|\.\.\/)/.test(uri);

  return isAbsolute || isRelative ? uri : '';
}
