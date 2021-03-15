export function encodeAsFormUrl(
  obj: Record<string, string | number | boolean>
) {
  const body = [];

  for (const property in obj) {
    const key = encodeURIComponent(property);
    const value = encodeURIComponent(obj[property]);
    body.push(`${key}=${value}`);
  }

  return body.join('&');
}
