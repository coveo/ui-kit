export function filterProtocol(uri: string) {
  const isAbsolute = /^(https?|ftp|file|mailto|tel|sip|data):/i.test(uri);
  const isRelative = /^\//.test(uri);

  return isAbsolute || isRelative ? uri : '';
}
