export function findEncoding(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const charset =
    contentType.split(';').find((part) => part.indexOf('charset=') !== -1) ||
    '';

  return charset.split('=')[1] || 'UTF-8';
}
