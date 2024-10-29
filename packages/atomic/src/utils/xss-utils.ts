export function filterProtocol(uri: string) {
  console.log('alex');
  const isAbsolute = /^(https?|ftp|file|mailto|tel|sip):/i.test(uri);
  const isRelative = /^\//.test(uri);

  return isAbsolute || isRelative ? uri : '';
}
